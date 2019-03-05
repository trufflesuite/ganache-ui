import ReduxWeb3Provider from "./helpers/ReduxWeb3Provider";
import Web3 from "web3";

const prefix = "WEB3";

export const SET_WEB3_INSTANCE = `${prefix}/SET_WEB3_INSTANCE`;
export function setWeb3Instance(web3Instance) {
  return { type: SET_WEB3_INSTANCE, web3Instance };
}

export const SET_RPC_PROVIDER_URL = `${prefix}/SET_RPC_PROVIDER_URL`;
export function setRPCProviderUrl(url) {
  url = url.replace("0.0.0.0", "127.0.0.1");
  return function(dispatch, getState) {
    const provider = new ReduxWeb3Provider(url, dispatch, getState);
    const web3Instance = new Web3(provider);
    dispatch(setWeb3Instance(web3Instance));
  };
}
