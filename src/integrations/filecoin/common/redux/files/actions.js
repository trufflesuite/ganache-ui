import FilecoinPrefix from "../prefix";
import IPFSHttpClient from "ipfs-http-client";
import fs from "fs";
import { setToast } from "../../../../../common/redux/network/actions";
import { abbreviateCid } from "../../../common/utils/cid";

const prefix = `${FilecoinPrefix}/FILES`;

export const CLEAR_FILES_IN_VIEW = `${prefix}/CLEAR_FILES_IN_VIEW`;
export const clearFilesInView = function() {
  return { type: CLEAR_FILES_IN_VIEW, files: [] };
};

export const ADD_FILES_TO_VIEW = `${prefix}/ADD_FILES_TO_VIEW`;

export const addFilesToView = function() {
  return async function(dispatch, getState) {
    const state = getState();

    const files = await getFiles(state.filecoin.core.ipfsUrl);

    dispatch({ type: ADD_FILES_TO_VIEW, files });
  };
};

const recursivelyFindFiles = async function(client, cid) {
  let files = [];

  for await (const file of client.ls(cid)) {
    if (file.type === "file") {
      file.download = {}; // an object we use to display download progress
      files.push(file);
    } else if (file.type === "dir") {
      files = files.concat(await recursivelyFindFiles(client, file.cid));
    }
  }

  return files;
}

export const getFiles = async function(url) {
  const client = IPFSHttpClient(url);
  let files = [];
  for await (const pin of client.pin.ls({ type: "recursive" })) {
    files = files.concat(await recursivelyFindFiles(client, pin.cid));
  }
  return files;
};

export const FILE_DOWNLOAD_PROGRESS = `${prefix}/FILE_DOWNLOAD_PROGRESS`;
export const fileDownloadProgress = function(cid, progress) {
  return async function(dispatch, getState) {
    dispatch({ type: FILE_DOWNLOAD_PROGRESS, cid, progress });
  };
}

export const FILE_DOWNLOAD_ERROR = `${prefix}/FILE_DOWNLOAD_ERROR`;
export const fileDownloadError = function(cid, error) {
  return async function(dispatch, getState) {
    dispatch(setToast(`Error while downloading ${abbreviateCid(cid.toString(), 4)}: ${error}`, true));
    dispatch({ type: FILE_DOWNLOAD_ERROR, cid, error });
  };
}

export const FILE_DOWNLOAD_COMPLETE = `${prefix}/FILE_DOWNLOAD_COMPLETE`;
export const fileDownloadComplete = function(cid) {
  return async function(dispatch, getState) {
    dispatch({ type: FILE_DOWNLOAD_COMPLETE, cid });
  };
}

export const FILE_DOWNLOAD_CLEAR = `${prefix}/FILE_DOWNLOAD_CLEAR`;
export const fileDownloadClear = function(cid) {
  return async function(dispatch, getState) {
    dispatch({ type: FILE_DOWNLOAD_CLEAR, cid });
  };
}

export const downloadFile = function(cid, destination) {
  return async function(dispatch, getState) {
    const client = IPFSHttpClient(getState().filecoin.core.ipfsUrl);

    dispatch(fileDownloadProgress(cid, 0));

    // We should only have one file here because we only show
    // leafs on the FilesScreen, so we just break whenever we can
    let bytesWritten = 0;
    let errored = false;

    const fileDetails = getState().filecoin.files.inView.find(f => f.cid.toString() === cid.toString());

    for await (const file of client.get(cid)) {
      if (file.type === "file" && file.content) {
        let fileStream;

        try {
          fileStream = fs.createWriteStream(destination, { encoding: "binary" });
          fileStream.once("error", (e) => {
            throw e;
          });
          for await (const chunk of file.content) {
            await new Promise(resolve => {
              if (fileStream.write(chunk)) {
                resolve();
              } else {
                fileStream.once("drain", () => {
                  resolve();
                });
              }
            });
            bytesWritten += chunk.byteLength;
            dispatch(fileDownloadProgress(cid, bytesWritten / fileDetails.size));
          }
        } catch (e) {
          dispatch(fileDownloadError(cid, e.message));
          errored = true;
        } finally {
          if (fileStream) {
            fileStream.close();
          }
        }

        break;
      }
    }

    if (!errored) {
      dispatch(fileDownloadComplete(cid));
    }

    setTimeout(() => dispatch(fileDownloadClear(cid)), 5000);
  };
};
