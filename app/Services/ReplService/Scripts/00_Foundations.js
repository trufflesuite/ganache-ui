global.helpList = []


function clear() {
  process.stdout.write('\u001B[2J\u001B[0;0f');
}

global.helpList.push({ command: 'clear()', description: 'Clears the REPL'})
global.helpList.push({ command: 'help()', description: 'This command'})

function help() {
  global.helpList.forEach((cmd) => {
    console.log(`    ${cmd.command} - ${cmd.description}`)
  })
}
