import React, { Component } from "react";
import Modal from "../../../../../../renderer/components/modal/Modal";
import ModalDetails from "../../../../../../renderer/components/modal/ModalDetails";

class NodeModal extends Component{
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.data.node
    };
  }

  render() {
    const node = this.state;
    const isEditing = this.props.isEdit;
    return (
      <Modal className="ErrorModal">
        <header>
          <h4>{this.props.data.title}</h4>
          <button onClick={this.props.closeModal}>X</button>
        </header>
        <section className="subTitle">
          
        </section>
        <section>
          <div>Legal Name</div>
          <input type="text" disabled={isEditing} onChange={(e) => {
            this.setState({name: e.target.value});
          }} value={node.name||""}>
          </input>

          <div>RPC Port</div>
          <input type="text" onChange={(e) => {
            this.setState({rpcPort: e.target.value});
          }} value={node.rpcPort||""}>
          </input>

          <div>Admin Port</div>
          <input type="text" onChange={(e) => {
            this.setState({adminPort: e.target.value});
          }} value={node.adminPort||""}>
          </input>

          <div>P2P Port</div>
          <input type="text" onChange={(e) => {
            this.setState({p2pPort: e.target.value});
          }} value={node.p2pPort||""}>
          </input>

          <div>Network Map</div>
          <select multiple={true} onChange={(e) => {
            const selectedNodes = [...e.target.options].filter(o => o.selected).map(o => o.value);
            this.setState({nodes: selectedNodes});
          }} value={node.nodes}>
            {this.props.allNodes.filter(n => n.safeName !== node.safeName).map(n => {
              return <option key={n.safeName} value={n.safeName}>{n.name}</option>
            })}
          </select>

          <div>CorDapps</div>
          <select multiple={true} onChange={(e) => {
            const selectedCoreDapps = [...e.target.options].filter(o => o.selected).map(o => o.value);
            this.setState({cordapps: selectedCoreDapps});
          }} value={isEditing ? node.cordapps : this.props.allCordDapps}>
            {this.props.allCordDapps.map(corDapp => {
              return <option key={corDapp}>{corDapp}</option>
            })}
          </select>
          <footer>
            <button onClick={()=>{this.props.handleNodeUpdate(node)}}>{this.props.data.buttonText}</button>
          </footer>
        </section>
      </Modal>
    );
  }
}

class NodesScreen extends Component {
  constructor(props){
    super(props);
    this.state = {selectedIdx: null};
  }

  handleNodeClick = idx => () => {
    this.setState({
      selectedIdx: this.state.selectedIdx === idx ? null : idx,
    });
  }

  handleAddNodeClick = () =>{
    this.setState({addNode: true});
  }

  handleEditNodeClick = () =>{
    const idx = this.state.selectedIdx;
    if (idx !== null) {
      this.setState({editNode: idx});
    }
  }

  _getAllNodes(){
    return this.props.data.type === "nodes" ? this.props.config.settings.workspace.nodes : this.props.config.settings.workspace.notaries
  }

  removeNode = (idx) => {
    if (this.state.selectedIdx === idx) {
      this.state.selectedIdx = null;
    }
    const nodes = this._getAllNodes();
    nodes.splice(idx, 1);
    this.forceUpdate();
  }

  handleRemoveNodeClick = () =>{
    const type = this.props.data.type === "nodes" ? "Node" : "Notary";
    const idx = this.state.selectedIdx;
    if (idx !== null) {
      const modalDetails = new ModalDetails(
        ModalDetails.types.WARNING,
        [
          {
            click: modal => {
              this.removeNode(idx);
              modal.close();
            },
            value: "Remove",
          },
          {
            value: "Cancel",
          },
        ],
        `Remove ${type}?`,
        "This Node will be removed.",
      );
  
      this.props.dispatch(ModalDetails.actions.setModalError(modalDetails));
    }
  }

  validateChange = (e) => {
    this.props.validateChange(e, {});
  }

  updateNetworkMap = (node) => {
    this.props.config.settings.workspace.nodes.forEach(other => {
      if (node.safeName === other.safeName) return;

      const otherIndexOfNode = other.nodes.indexOf(node.safeName);
      const otherHasConnection = otherIndexOfNode !== -1;
      const nodeHasConnection = node.nodes.includes(other.safeName);
      // if `other` has this `node`, but this `node` doesn't have `other`, we
      // need update `other` to remove this `node`
      if (otherHasConnection && !nodeHasConnection) {
        other.nodes.splice(otherIndexOfNode, 1);
      // if this `node` has `other`, but `other` doesn't have this `node`, we
      // need to add this `node` to `other`
      } else if(nodeHasConnection && !otherHasConnection) {
        other.nodes.push(node.safeName);
      }
    });
  }

  render() {
    const type = this.props.data.type === "nodes" ? "Node" : "Notary";
    const pluralType = this.props.data.type === "nodes" ? "Nodes" : "Notaries";
    const nodes = this._getAllNodes();
    const corDapps = this.props.config.settings.workspace.projects.slice();
    let aModal;
    if (this.state.addNode) {
      const data = {};
      data.title = `Add New ${type}`;
      data.buttonText = "Add";
      data.node = {};
      aModal = (
        <NodeModal allNodes={this.props.config.settings.workspace.nodes} allCordDapps={corDapps} closeModal={()=>{this.setState({addNode: null})}} isEdit={false} data={data} handleNodeUpdate={(node) => {
          nodes.push(node);
          node.dbPort = 5432;
          node.safeName = node.name.toLowerCase().replace(/[^a-z]+/g,"_");
          this.state.addNode = null;
          this.updateNetworkMap(node);
          this.forceUpdate();
        }}></NodeModal>
      );
    } else if (this.state.editNode != null) {
      const idx = this.state.editNode;
      const node = nodes[idx];
      const data = {};
      data.title = `Edit ${type}`;
      data.buttonText = "Edit";
      data.node = node;
      aModal = (
        <NodeModal allNodes={this.props.config.settings.workspace.nodes} allCordDapps={corDapps} closeModal={()=>{this.setState({editNode: null})}} isEdit={true} data={data} handleNodeUpdate={(node) => {
          nodes[idx] = node;
          node.dbPort = 5432;
          this.state.editNode = null;
          this.updateNetworkMap(node);
          this.forceUpdate();
        }}></NodeModal>
      );
    }

    return (
      <div>
        <h2>{pluralType.toUpperCase()}</h2>
        <section>
          <div className="WorkspaceProjects">
            <div className="projectItemContainer">
              {
                nodes.map((node, idx) => {
                  const selected = this.state.selectedIdx === idx;
                  return (
                    <div
                      className={`projectItem ${selected && "active"}`}
                      key={node.safeName}
                      onClick={this.handleNodeClick(idx)}
                    >
                      {node.name}
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div className="WorkspaceButtons">
            <button
              className="btn btn-primary"
              onClick={this.handleAddNodeClick}
            >
              ADD {type.toUpperCase()}
            </button>
            <button
              className="btn btn-primary"
              disabled={this.state.selectedIdx === null}
              onClick={this.handleEditNodeClick}
            >
              EDIT {type.toUpperCase()}
            </button>
            <button
              className="btn btn-primary"
              disabled={this.state.selectedIdx === null}
              onClick={this.handleRemoveNodeClick}
            >
              REMOVE {type.toUpperCase()}
            </button>
          </div>
        </section>
        {aModal}
      </div>
    );
  }
}

export default NodesScreen;
