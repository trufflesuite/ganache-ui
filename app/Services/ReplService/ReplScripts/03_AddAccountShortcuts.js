web3.eth.getAccounts((err, accounts) => {
  global.totalAccounts = accounts.length
  global.helpList.push({ command: 'totalAccounts', description: 'The number of accounts'})
  global.accounts = accounts
  global.helpList.push({ command: 'accounts', description: 'An array of all account addresses'})
  accounts.map((account, index) => {
    global['account'+index] = account
    global.helpList.push({ command: `account${index}`, description: `The address of account${index}`})
  })
})
