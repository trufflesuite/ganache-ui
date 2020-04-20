import * as CordaShell from "./actions";
import { ipcRenderer } from "electron";
import { Terminal } from "xterm";
import { FitAddon } from 'xterm-addon-fit';

export default function(state = {}, action) {
  let term, div, fitAddon;
  switch (action.type) {
    case CordaShell.GET_TERMINAL:
      if (Object.prototype.hasOwnProperty.call(state, action.safeName)) {
        return state;
      }
      fitAddon = new FitAddon();
      term = new Terminal({
        'theme': { background: "#333" }
      });
      term.onData(data => {
        ipcRenderer.send("xtermData", {node: action.safeName, data});
      });
      div = document.createElement("div");
      term.fitAddon = fitAddon;
      term.loadAddon(fitAddon);
      term.div = div;
      term._isOpened = false;
      ipcRenderer.send("startShell", {node: action.safeName});
      return Object.assign({}, state, {
        [action.safeName] : term,
        [Symbol.for("lastShell")] : action.safeName
      });
    case CordaShell.SSH_RESIZE:
      if (Object.entries(state)) {
        state[action.node].write(action.data);
      }
      return state;
    case CordaShell.SSH_DATA:
      if (Object.prototype.hasOwnProperty.call(state, action.node)) {
        state[action.node].write(action.data);
      }
      return state;
    case CordaShell.CLEAR_TERM:
      if (Object.prototype.hasOwnProperty.call(state, action.node)) {
        state[action.node].clear();
      }
      return state;
    default:
      return state;
  }
}
