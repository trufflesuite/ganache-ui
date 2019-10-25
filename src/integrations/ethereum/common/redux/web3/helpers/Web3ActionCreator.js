// const prefix = "WEB3ACTIONCREATOR"
// export const WEB3_REQUEST_STARTED = `${prefix}/WEB3_REQUEST_STARTED`
// export function Web3RequestStarted(name) {
//   return { type: WEB3_REQUEST_STARTED, name }
// }

// export const WEB3_REQUEST_FAILED = `${prefix}/WEB3_REQUEST_FAILED`
// export function Web3RequestFailed(name, error) {
//   return { type: WEB3_REQUEST_FAILED, name, error}
// }

// export const WEB3_REQUEST_SUCCEEDED = `${prefix}/WEB3_REQUEST_SUCCEEDED`
// export function Web3RequestSucceeded(name, result) {
//   return { type: WEB3_REQUEST_SUCCEEDED, name, result }
// }

export async function web3Request(name, args, web3Instance) {
  let fn = web3Instance.eth[name];

  return await fn.apply(web3Instance.eth, args);
}

export async function web3ActionCreator(dispatch, getState, name, args) {
  // This specifically pulls state from the web3 reducer. Smell?
  let web3Instance = getState().web3.web3Instance;
  return await web3Request(name, args, web3Instance);
}

export function web3CleanUpHelper(dispatch, getState) {
  let web3Instance = getState().web3.web3Instance;
  if (web3Instance) {
    let provider = web3Instance.currentProvider;

    // clear out current provider to stop active subscription monitoring
    web3Instance.setProvider(null);

    if (provider && provider.connection && provider.connection.close) {
      provider.connection.close();
    }
  }
}
