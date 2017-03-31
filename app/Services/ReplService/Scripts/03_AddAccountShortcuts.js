web3.eth.getAccounts((err, accounts) => {
  global.totalAccounts = accounts.length
  global.accounts = accounts
  accounts.map((account, index) => {
    global['account'+index] = account
  })
})
