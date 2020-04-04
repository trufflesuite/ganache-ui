import React, { Component } from "react";
import { Link } from "react-router-dom";
import ContractsIcon from "../../../../renderer/icons/contract-icon.svg";

class TransactionCommands extends Component {
  render() {
    const commands = this.props.commands;
    let elements = null;
    if (commands === null){
      elements = [<div style={{marginBottom:".5em"}} key="loading">Loading...</div>];
    } else if (commands.length === 0) {
    elements = [<div style={{marginBottom:".5em"}} key="no-command">No commands</div>];
    } else {
      elements = commands.map((command, i) => {
        let link = "";
        if (command.contractFile) {
          link = (<Link title={command.contractFile} to={`/corda/cordapps/${btoa(command.contractFile)}`} style={{position: "absolute", marginLeft:".25rem"}}><ContractsIcon style={{width:"18px", height:"18px", "color": "#333"}}/></Link>);
        }
        return (<div style={{marginBottom:".5em"}} key={"command" + command.value["@class"] + i}>
          {command.value["@class"].split(".").map(d=>(<>{d}<div style={{display:"inline-block"}}>.</div></>))}
        {link}</div>);
      });
    }

    return (
      <div>
        <h3 className="Label">Commands</h3>
        <div>{elements}</div>
      </div>
    );
  }
}

export default TransactionCommands;
