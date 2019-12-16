module.exports = {
  name: "Quickstart",
  isDefault: true,
  postgresPort: 15432,
  nodes: [{
    "name": "O=Party A,L=London,C=GB",
    "safeName" : "partya",
    "rpcPort": 10000,
    "adminPort": 10001,
    "p2pPort": 10002,
    "cordapps": [],
    "nodes": ["partyb", "partyc", "notary"]
  },{
    "name": "O=Party B,L=Paris,C=FR",
    "safeName" : "partyb",
    "rpcPort": 10003,
    "adminPort": 10004,
    "p2pPort": 10005,
    "cordapps": [],
    "nodes": ["partya", "partyc", "notary"]
  },{
    "name": "O=Party C,L=New York,C=US",
    "safeName" : "partyc",
    "rpcPort": 10006,
    "adminPort": 10007,
    "p2pPort": 10008,
    "cordapps": [],
    "nodes": ["partya", "partyb", "notary"]
  }],
  notaries : [{
    "name": "O=Notary Service,L=London,C=GB",
    "safeName" : "notary",
    "rpcPort": 10009,
    "adminPort": 10010,
    "p2pPort": 10011,
    "cordapps": [],
    "nodes": ["partya", "partyb", "partyc"]
  }]
};
