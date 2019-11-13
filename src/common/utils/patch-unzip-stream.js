const { chmodSync } = require("fs");
const { join } = require("path");

const CENTRAL_DIRECTORY_FILE_HEADER_SUFFIX = 8

function patchUnzipStream(extractor) {
  const path = extractor.opts.path;
  const unzipStream = extractor.unzipStream;
  const _decodeString = unzipStream._decodeString.bind(unzipStream);
  const _readExtraFields = unzipStream._readExtraFields.bind(unzipStream);
  const oldProcessDataChunk = unzipStream.processDataChunk;
  extractor.unzipStream.processDataChunk = function (chunk) {
    // call the old method, as it calculates some values we need and
    // performs some other state checks
    const ret = oldProcessDataChunk.call(unzipStream, chunk);

    // if ret is 0 it means we haven't buffered enough data yet, exit now
    if (ret === 0) return 0;

    const state = unzipStream.state;
    // our permissions data is in CENTRAL_DIRECTORY_FILE_HEADER_SUFFIX
    if (state === CENTRAL_DIRECTORY_FILE_HEADER_SUFFIX) {
      const parsedEntity = unzipStream.parsedEntity;
      // if this zip was made by Unix we can parse its permissions
      const isUnix = ((parsedEntity.versionMadeBy & 0xff00) >> 8) === 3;
      if (isUnix) {
        const isUtf8 = (parsedEntity.flags & 0x800) !== 0;
        const fileNameLength = parsedEntity.fileNameLength;
        const entrySlice = chunk.slice(0, fileNameLength);
        let entryPath;
        if (isUtf8) {
          entryPath = _decodeString(entrySlice, isUtf8);
        } else {
          const extraDataBuffer = chunk.slice(fileNameLength, fileNameLength + parsedEntity.extraFieldLength);
          const extra = _readExtraFields(extraDataBuffer);
          if (extra && extra.parsed && extra.parsed.path) {
            entryPath = extra.parsed.path;
          } else {
            entryPath = _decodeString(entrySlice, isUtf8);
          }
        }

        // parse the permission bits out of the externalFileAttributes field
        const unixAttrs = parsedEntity.externalFileAttributes >>> 16;
        const filePermissions = unixAttrs & 0b111111111;

        // if the perms are the default, change them
        if (filePermissions !== 0o666) {
          // and finally, change our permissions
          const destPath = join(path, entryPath);
          try {
            chmodSync(destPath, filePermissions);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    return ret;
  };
}

module.exports = patchUnzipStream;
