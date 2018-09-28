const TruffleDecoder = require("truffle-decoder");

async function getContractState(truffleContract, inheritedContracts, web3Host, block) {
  if (typeof block === "undefined") {
    block = "latest";
  }

  const decoder = TruffleDecoder.forContract(truffleContract, inheritedContracts, web3Host);
  decoder.init();

  const contractState = await decoder.state(block);

  return contractState;
}

async function getDecodedEvent(truffleContract, inheritedContracts, web3Host, block, log) {
  if (typeof block === "undefined") {
    block = "latest";
  }

  const decoder = TruffleDecoder.forContract(truffleContract, inheritedContracts, web3Host);
  decoder.init();

  const decodedLog = await decoder.decodeLog(log);

  return decodedLog;
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
  toJSON
};
