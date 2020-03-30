import React, { Component } from "react";
import Modal from "../../../../../../renderer/components/modal/Modal";

export const MODES = {
  EDIT: "edit",
  ADD: "add"
}

export const PORT_FIELDS = { "rpcPort": "RPC Port", "adminPort": "Admin Port", "p2pPort": "P2P Port", "sshdPort": "SSHD Port" };

export class NodeModal extends Component {
  PORT_MIN = 1024;
  PORT_MAX = 65536;
  constructor(props) {
    super(props);
    const node = { ...this.props.data.node };
    node.cordapps = node.cordapps ? [...node.cordapps] : [];
    this.state = {
      node,
      errors: this.validate(node)
    };
  }

  validate = (node) => {
    const errors = {};
    Object.keys(PORT_FIELDS).forEach(portField => {
      const value = node[portField];
      if (value < this.PORT_MIN || value > this.PORT_MAX) {
        errors[portField] = `Port must be a value from ${this.PORT_MIN} to ${this.PORT_MAX}`;
      }
    });
    return errors;
  }

  save = () => {
    const errors = this.validate(this.state.node);
    if (Object.keys(errors).length === 0) {
      this.props.handleNodeUpdate(this.state);
    } else {
      this.setState({ errors });
    }
  }

  portChangeHandler = (name) => {
    return (e) => {
      const value = parseInt(e.target.value, 10);
      if (value > this.PORT_MAX) return;
      this.setState({node: {...this.state.node, [name]: value }});
    };
  }

  render() {
    const canEditAll = this.props.canEditAll;
    const node = this.state.node;
    const errors = this.state.errors;
    const isEditing = this.props.mode === MODES.EDIT;
    const nodeErrors = this.props.nodeErrors;

    const portHtmls = Object.entries(PORT_FIELDS).map(portInfo => {
      const key = portInfo[0];
      return (
        <label key={key}>
          <span>{portInfo[1]}</span>
          <input type="number" min={this.PORT_MIN} max={this.PORT_MAX} onChange={this.portChangeHandler(key)} value={node[key] || ""}>
          </input>
        </label>
      )
    });
    return (
      <Modal className="ErrorModal">
        <header>
          <h4>{this.props.data.title}</h4>
          <button onClick={this.props.closeModal}>×</button>
        </header>
        <section>
          <label>
            <span>Legal Name</span>
            <input type="text" disabled={canEditAll ? false : isEditing} onChange={(e) => {
              this.setState({node: {...this.state.node, name: e.target.value }});
            }} value={node.name || ""}>
            </input>
            { !this.props.nodeErrors.legalName || this.props.nodeErrors.legalName.length === 0 ? "" :
              <div className="ValidationError">{this.props.nodeErrors.legalName.map((error, i) => {
                  return (<div key={"name" + error + i}>{error}</div>);
                })}
              </div>
            }
          </label>

          <div className="portFields">
            <div className="portData">
              {portHtmls}
            </div>
            {
                Object.entries(PORT_FIELDS).map(portInfo => {
                  const key = portInfo[0];
                  return (<>
                    {errors[key] ? <div className="ValidationError">{errors[key]}</div> : ""}
                    {nodeErrors[key] ? <div className="ValidationError">{nodeErrors[key]}</div> : ""}
                  </>);
                })
              }
          </div>

          {this.props.type === "Notary" ? "" : (<>
            <label>
              <span>Network Map</span>
              <select multiple={true} onChange={(e) => {
                const selectedNodes = [...e.target.options].filter(o => o.selected).map(o => o.value);
                this.setState({node: {...this.state.node, nodes: selectedNodes }});
              }} value={node.nodes}>
                {this.props.allNodes.filter(n => n.safeName !== node.safeName).map(n => {
                  return <option key={n.safeName} value={n.safeName}>{n.name}</option>
                })}
              </select>
              <em><small style={{color:"#666", margin: "-.9rem 0 .9rem", "display": "block"}}>{process.platform === "darwin" ? "Command ⌘" : "Ctrl"}+Click to select multiple</small></em>
            </label>
          </>)}

          <label>
            <span>CorDapps</span>
            <select multiple={true} onChange={(e) => {
              const selectedCoreDapps = [...e.target.options].filter(o => o.selected).map(o => o.value);
              this.setState({node: {...this.state.node, cordapps: selectedCoreDapps }});
            }} value={isEditing ? node.cordapps : this.props.allCordDapps}>
              {this.props.allCordDapps.map(corDapp => {
                return <option key={corDapp}>{corDapp}</option>
              })}
            </select>
            <em><small style={{color:"#666", margin: "-.9rem 0 .9rem", "display": "block"}}>{process.platform === "darwin" ? "Command ⌘" : "Ctrl"}+Click to select multiple</small></em>
          </label>
          <footer>
            <button onClick={this.save}>Save</button>
            <button onClick={this.props.closeModal}>Cancel</button>
          </footer>
        </section>
      </Modal>
    );
  }
}
