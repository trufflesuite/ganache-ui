module.exports = {
  name: "Quickstart",
  isDefault: true,
  runBootstrap: true,
  postgresPort: null,
  nodes: [{
    "name": "O=Party A,L=London,C=GB",
    "safeName" : "partya",
    "rpcPort": 10000,
    "adminPort": 10001,
    "p2pPort": 10002,
    "cordapps": [],
    "nodes": ["partyb", "partyc"],
    "sshdPort": 11000,
    "version": "4_3"
  },{
    "name": "O=Party B,L=Paris,C=FR",
    "safeName" : "partyb",
    "rpcPort": 10003,
    "adminPort": 10004,
    "p2pPort": 10005,
    "cordapps": [],
    "nodes": ["partya", "partyc"],
    "sshdPort": 11003,
    "version": "4_3"
  },{
    "name": "O=Party C,L=New York,C=US",
    "safeName" : "partyc",
    "rpcPort": 10006,
    "adminPort": 10007,
    "p2pPort": 10008,
    "cordapps": [],
    "nodes": ["partya", "partyb"],
    "sshdPort": 11006,
    "version": "4_3"
  }],
  notaries : [{
    "name": "O=Notary Service,L=London,C=GB",
    "safeName" : "notary",
    "rpcPort": 10009,
    "adminPort": 10010,
    "p2pPort": 10011,
    "cordapps": [],
    "sshdPort": 11009,
    "version": "4_3"
  }],
  projects: [],
  cordappHashMap: {}
};
