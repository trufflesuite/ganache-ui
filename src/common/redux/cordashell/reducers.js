import * as CordaShell from "./actions";
import { ipcRenderer } from "electron";
import { Terminal } from "xterm";

export default function(state = {}, action) {
  let term, div;
  switch (action.type) {
    case CordaShell.GET_TERMINAL:
      if (Object.prototype.hasOwnProperty.call(state, action.safeName)) {
        return state;
      }
      term = new Terminal();
      term.onData(data => {
        ipcRenderer.send("xtermData", {node: action.safeName, data});
      });
      div = document.createElement("div");
      term.div = div;
      term.open(div);
      return Object.assign({}, state, {
        [action.safeName] : term
      });
    case "sshData":
      if (Object.prototype.hasOwnProperty.call(state, action.node)) {
        state[action.node].write(action.data);
      }
      return state;
    default:
      return state;
  }
}
