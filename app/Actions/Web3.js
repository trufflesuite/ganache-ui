import ReduxWeb3Provider from './helpers/ReduxWeb3Provider'

const prefix = "WEB3"

export const SET_RPC_PROVIDER = `${prefix}/SET_RPC_PROVIDER`
export function setRPCProvider(provider) {
  return { type: SET_RPC_PROVIDER, provider }
}

export const SET_RPC_PROVIDER_URL = `${prefix}/SET_RPC_PROVIDER_URL`
export function setRPCProviderUrl(url) {
  return function(dispatch) {
    const provider = new ReduxWeb3Provider(url, dispatch)
    dispatch(setRPCProvider(provider))
  }
}