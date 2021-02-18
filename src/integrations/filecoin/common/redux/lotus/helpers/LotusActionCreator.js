export async function lotusRequest(name, args, lotusInstance) {
  const fn = lotusInstance[name];

  return await fn.apply(lotusInstance, args);
}

export async function lotusActionCreator(dispatch, getState, name, args) {
  // This specifically pulls state from the web3 reducer. Smell?
  const lotusInstance = getState().filecoin.lotus.lotusInstance;
  if (lotusInstance) {
    return await lotusRequest(name, args, lotusInstance);
  }
}

export function lotusCleanUpHelper(dispatch, getState) {
  const lotusInstance = getState().filecoin.lotus.lotusInstance;
  if (lotusInstance && lotusInstance.provider) {
    lotusInstance.provider.destroy();
  }
}
