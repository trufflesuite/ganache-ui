import ReduxLotusProvider from "./helpers/ReduxLotusProvider";
import { LotusRPC } from "@filecoin-shipyard/lotus-client-rpc";
import FilecoinPrefix from "../prefix";

const prefix = `${FilecoinPrefix}/LOTUS`;

export const SET_LOTUS_INSTANCE = `${prefix}/SET_LOTUS_INSTANCE`;
export function setLotusInstance(lotusInstance) {
  return { type: SET_LOTUS_INSTANCE, lotusInstance };
}

export const SET_RPC_PROVIDER_URL = `${prefix}/SET_RPC_PROVIDER_URL`;
export function setRPCProviderUrl(url) {
  return async function(dispatch, getState) {
    const provider = new ReduxLotusProvider(url, dispatch, getState);
    await provider.initialize();
    const lotusInstance = new LotusRPC(provider, { schema: provider.Schema });
    dispatch(setLotusInstance(lotusInstance));
  };
}
