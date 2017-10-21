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

export function web3Request(name, args, provider, next) {
  // This specifically pulls state from the web3 reducer. Smell?
  let web3 = new Web3(provider)
  
  //dispatch(Web3RequestStarted(name))

  let fn = web3.eth[name]

  args.push(next)

  fn.apply(web3.eth, args)
}

export function web3ActionCreator(name, args, next) {
  if (typeof args == "function") {
    next = args
    args = []
  }

  return function(dispatch, getState) {
    let provider = getState().web3.provider
    web3Request(name, args, provider, (err, result) => {
      next(result, dispatch, getState)
    })
  }
}