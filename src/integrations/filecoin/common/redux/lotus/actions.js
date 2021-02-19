import ReduxLotusProvider from "./helpers/ReduxLotusProvider";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import FilecoinPrefix from "../prefix";

const prefix = `${FilecoinPrefix}/LOTUS`;

export const SET_LOTUS_INSTANCE = `${prefix}/SET_LOTUS_INSTANCE`;
export function setLotusInstance(lotusInstance) {
  return { type: SET_LOTUS_INSTANCE, lotusInstance };
}

export const SET_LOTUS_SCHEMA = `${prefix}/SET_LOTUS_SCHEMA`;
export function setLotusSchema(schema) {
  return { type: SET_LOTUS_SCHEMA, schema };
}

export async function createLotusInstance(dispatch, getState, url) {
  const reduxProvider = new ReduxLotusProvider(url, dispatch, getState);
  await reduxProvider.initialize();
  const schema = getState().filecoin.lotus.schema;
  const lotusInstance = new LotusRPC(reduxProvider, { schema });
  return lotusInstance;
}
