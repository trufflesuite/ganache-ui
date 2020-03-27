import React, { Component } from "react";
import {NodeModal, MODES, PORT_FIELDS} from "./NodeModal";
import ModalDetails from "../../../../../../renderer/components/modal/ModalDetails";
import { STARTUP_MODE } from "../../../../../../common/redux/config/actions";

function portValidator(node, allNodes) {
  const errors = {};
  const portFields = Object.keys(PORT_FIELDS);
  [...allNodes, node].forEach(otherNode => { 
    portFields.forEach(nodeField => {
      const nodeFieldValue = node[nodeField];
      portFields.forEach(otherNodeField => {
        if (otherNode.safeName === node.safeName && otherNodeField === nodeField) return;

        const otherNodeFieldValue = otherNode[otherNodeField];
        if (nodeFieldValue === otherNodeFieldValue){
          errors[nodeField] = `${PORT_FIELDS[nodeField]} value ${nodeFieldValue} conflicts with ${PORT_FIELDS[otherNodeField]} value for "${otherNode.name}".`;
        }
      });
    })
  });
  return errors;
}

function legalNameValidator(stringName) {
  const errors = [];
  const requiredKeys = ["O", "L", "C"];
  const requiredCheck = new Set();
  const validKeys = [...requiredKeys, "CN", "OU", "ST"];
  stringName.split(",").forEach(n => {
    const eq = n.indexOf("=");
    const key = (eq === -1 ? n : n.substring(0, eq)).trim();
    const value = (eq === -1 ? "" : n.substring(eq + 1)).trim();
    if (key.length === 0) {
      errors.push(`Invalid attribute format. Expected non-zero length string, found "=".`);
      return;
    }
    const upperKey = key.toUpperCase();
    if (!validKeys.includes(upperKey)) {
      errors.push(`"${key}" is not a valid attribute. Valid attributes are: ${validKeys.join(", ")}.`);
    } else if (value.length === 0) {
      errors.push(`"${key}" attribute must have a non-zero length value.`);
    }

    if (requiredKeys.includes(upperKey)) {
      if (requiredCheck.has(upperKey)) {
        errors.push(`Duplicate attribute for "${upperKey}" detected.`);
      } else {
        requiredCheck.add(upperKey);
      }
    }

    if (upperKey === "C" && value.length > 0 && value.length !== 2) {
      errors.push(`"C" (Country) attribute must be a 2-letter country code, found "${value}".`);
    }
  });
  if (requiredCheck.size < requiredKeys.length) {
    errors.push(`Legal Name requires attributes: ${requiredKeys.join(", ")}.`);
  }
  return errors;
}

class NodesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { mode: null, selectedIdx: null, nodeErrors: null };
  }

  handleNodeClick = idx => () => {
    this.setState({
      selectedIdx: this.state.selectedIdx === idx ? null : idx,
    });
  }

  resetMode = () => {
    this.setState({ mode: null, nodeErrors: null });
  }

  handleAddNodeClick = () => {
    this.setState({ mode: MODES.ADD });
  }

  handleEditNodeClick = () => {
    const idx = this.state.selectedIdx;
    if (idx !== null) {
      this.setState({ mode: MODES.EDIT, editNode: idx });
    }
  }

  _getAllNodes() {
    return this.props.data.type === "nodes" ? this.props.config.settings.workspace.nodes : this.props.config.settings.workspace.notaries
  }

  removeNode = (idx) => {
    if (this.state.selectedIdx === idx) {
      // ignoring this lint issue because we're going to force a re-render anyway...
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.selectedIdx = null;
    }
    const nodes = this._getAllNodes();
    const node = nodes[idx];
    node.nodes = [];
    node.notaries = [];
    this.updateNetworkMap(node);
    nodes.splice(idx, 1);
    this.forceUpdate();
  }

  handleRemoveNodeClick = () => {
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

  updateNetworkMap = (node) => {
    const nodeType = this.props.data.type;

    // we don't currently support customizing the networkmap for notaries
    if (nodeType === "notaries") return;
    this.props.config.settings.workspace.nodes.forEach(other => {
      if (node.safeName === other.safeName) return;

      const otherIndexOfNode = other[nodeType].indexOf(node.safeName);
      const otherHasConnection = otherIndexOfNode !== -1;
      const nodeHasConnection = node[nodeType].includes(other.safeName);
      // if `other` has this `node`, but this `node` doesn't have `other`, we
      // need update `other` to remove this `node`
      if (otherHasConnection && !nodeHasConnection) {
        other[nodeType].splice(otherIndexOfNode, 1);
        // if this `node` has `other`, but `other` doesn't have this `node`, we
        // need to add this `node` to `other`
      } else if (nodeHasConnection && !otherHasConnection) {
        other[nodeType].push(node.safeName);
      }
    });
  }

  render() {
    const type = this.props.data.type === "nodes" ? "Node" : "Notary";
    const pluralType = this.props.data.type === "nodes" ? "Nodes" : "Notaries";
    const nodes = this._getAllNodes();
    const corDapps = this.props.config.settings.workspace.projects.slice();
    let nodeModal;
    const mode = this.state.mode;
    const nodesAndNotaries = [...this.props.config.settings.workspace.nodes, ...this.props.config.settings.workspace.notaries];
    if (mode) {
      const data = {};
      let handleNodeUpdate;
      switch (mode) {
        case MODES.EDIT: {
          const idx = this.state.editNode;
          data.title = `Edit ${type}`;
          data.node = nodes[idx];

          handleNodeUpdate = (node) => {
            nodes[idx] = node;
          };
        }
          break;
        case MODES.ADD:
          data.title = `Add New ${type}`;
          data.node = {};
          handleNodeUpdate = (node) => {
            nodes.push(node);
            node.safeName = node.name.toLowerCase().replace(/[^a-z]+/g, "_");
          };
          break;
      }
      nodeModal = (
        <NodeModal
          canEditAll={this.props.config.startupMode === STARTUP_MODE.NEW_WORKSPACE}
          allNodes={this.props.config.settings.workspace.nodes}
          allCordDapps={corDapps}
          closeModal={this.resetMode.bind(this)}
          mode={mode}
          data={data}
          type={type}
          nodeErrors={this.state.nodeErrors || {}}
          handleNodeUpdate={({ node }) => {
            const portErrors = portValidator(node, nodesAndNotaries);
            const legalNameErrors = legalNameValidator(node.name);
            if (Object.keys(portErrors).length) {
              this.setState({ nodeErrors: { ...portErrors } });
            } else if (legalNameErrors.length) {
              this.setState({ nodeErrors: { legalName: legalNameErrors } });
            } else {
              handleNodeUpdate(node);
              this.resetMode();
              this.updateNetworkMap(node);
              this.forceUpdate();
            }
          }}
        />
      );
    }

    /* 50 is totally arbitrary, but having a maximum of some value seems reasonable */
    /*   50 nodes would consume about 50 GB of memory */
    const ARBITRARY_MAXIMUM_NODES = 50;
    const count = this.props.config.settings.workspace.nodes.length + + this.props.config.settings.workspace.notaries.length;
    const noneSelected = this.state.selectedIdx == null || this.state.selectedIdx === "";
    return (
      <div>
        <h2>{pluralType.toUpperCase()}</h2>
        <section>
          <p>Note: Recommended maximum number of Nodes + Notaries for your current hardware is {Math.min(ARBITRARY_MAXIMUM_NODES, Math.max(3, navigator.hardwareConcurrency - 2))}.</p>
          <br />
          {this.props.config.validationErrors["nodes.nodeConfig"] && (
            <p className="ValidationError">
              {this.props.config.validationErrors["nodes.nodeConfig"]}
            </p>
          )}
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
              disabled={count >= ARBITRARY_MAXIMUM_NODES}
              onClick={this.handleAddNodeClick}
            >
              ADD {type.toUpperCase()}
            </button>
            <button
              className="btn btn-primary"
              disabled={noneSelected}
              onClick={this.handleEditNodeClick}
            >
              EDIT {type.toUpperCase()}
            </button>
            <button
              className="btn btn-primary"
              disabled={noneSelected}
              onClick={this.handleRemoveNodeClick}
            >
              REMOVE {type.toUpperCase()}
            </button>
          </div>
        </section>
        {nodeModal}
      </div>
    );
  }
}

export default NodesScreen;
