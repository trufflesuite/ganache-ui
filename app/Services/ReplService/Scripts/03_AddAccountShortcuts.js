web3.eth.getAccounts((err, accounts) => {
  global.totalAccounts = accounts.length
  accounts.map((account, index) => {
    global['account'+index] = account
  })
})
