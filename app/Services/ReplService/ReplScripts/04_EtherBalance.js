global.etherBalance = function(contract) {
  switch(typeof(contract)) {
    case "object":
      if(contract.address) {
      return web3.eth.getBalance(contract.address, (err, balance) => {
        console.log( web3.fromWei(balance, 'ether').toNumber())
      })
    } else {
      return new Error("cannot call getEtherBalance on an object that does not have a property 'address'")
    }
    break
    case "string":
      return web3.eth.getBalance(contract, (err, balance) => {
      console.log( web3.fromWei(balance, 'ether').toNumber())
    })
    break
  }
}

global.helpList.push({ command: 'etherBalance(<address>)', description: 'Returns the balance in ether of the given address (whether account or contract)'})
