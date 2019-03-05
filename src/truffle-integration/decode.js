const TruffleDecoder = require("truffle-decoder");

async function getContractState(
  truffleContract,
  inheritedContracts,
  web3Host,
  block,
) {
  if (typeof block === "undefined") {
    block = "latest";
  }

  const decoder = TruffleDecoder.forContract(
    truffleContract,
    inheritedContracts,
    web3Host,
  );
  decoder.init();

  let contractState;
  try {
    contractState = await decoder.state(block);
  } catch (e) {
    contractState = {};
    contractState.error = e.stack || e.toString();
  }

  return contractState;
}

async function getDecodedEvent(
  truffleContract,
  inheritedContracts,
  web3Host,
  log,
) {
  const decoder = TruffleDecoder.forContract(
    truffleContract,
    inheritedContracts,
    web3Host,
  );
  decoder.init();

  const decodedLog = await decoder.decodeLog(log);

  return decodedLog;
}

async function getDecodedTransaction(
  truffleContract,
  inheritedContracts,
  web3Host,
  transaction,
) {
  const decoder = TruffleDecoder.forContract(
    truffleContract,
    inheritedContracts,
    web3Host,
  );
  decoder.init();

  const decodedData = await decoder.decodeTransaction(transaction);

  return decodedData;
}

function toJSON(object) {
  // for every key, check if it has name/type/value members, if so, then assign value
  let result = {};

  const keys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    const v = object[keys[i]];

    switch (v.type) {
      case "string": {
        result[v.name] = v.value;
        break;
      }
      case "uint":
      case "int": {
        result[v.name] = v.value.toString();
        break;
      }
      case "struct": {
        result[v.name] = toJSON(v.value.members);
        break;
      }
      case "array": {
        // TODO:
      }
      case "mapping": {
        // TODO:
      }
    }
  }

  return result;
}

module.exports = {
  getContractState,
  getDecodedEvent,
  getDecodedTransaction,
  toJSON,
};
