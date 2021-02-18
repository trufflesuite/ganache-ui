import ReduxLotusProvider from "./helpers/ReduxLotusProvider";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import FilecoinPrefix from "../prefix";

const prefix = `${FilecoinPrefix}/LOTUS`;

export const SET_LOTUS_INSTANCE = `${prefix}/SET_LOTUS_INSTANCE`;
export function setLotusInstance(lotusInstance) {
  return { type: SET_LOTUS_INSTANCE, lotusInstance };
}

export async function createLotusInstance(dispatch, getState, url, schema) {
  const reduxProvider = new ReduxLotusProvider(url, dispatch, getState);
  await reduxProvider.initialize();
  const lotusInstance = new LotusRPC(reduxProvider, { schema });
  return lotusInstance;
}
