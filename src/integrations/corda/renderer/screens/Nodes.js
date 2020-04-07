import connect from "../../../../renderer/screens/helpers/connect";

import Graph from "react-graph-vis";
import NodeLink from "../components/NodeLink";
import React, { Component } from "react";

class Nodes extends Component {
  constructor() {
    super();

    this.state = {
      mode: "list",
      selectedNode: 0
    };
  }
  getNodes(workspace){
    return workspace.nodes.map((node) => (<NodeLink key={`node-${node.safeName}`} postgresPort={workspace.postgresPort} node={node} />));
  }

  getNotaries(workspace){
    return workspace.notaries.map((node) => (<NodeLink key={`node-${node.safeName}`} postgresPort={workspace.postgresPort} node={node} services={["Notary"]} />));
  }

  getEntities(){
    const workspace = this.props.config.settings.workspace;
    return this.getNodes(workspace).concat(this.getNotaries(workspace));
  }
  getGraph() {
    const workspace = this.props.config.settings.workspace;
    const entities = [...workspace.nodes, ...workspace.notaries];
    const edges = [];
    const map = {};
    const nodes = entities.map((node, i) => {
      map[node.safeName] = i;
      return { id: i, label: node.name, title: node.name };
    });
    entities.forEach((_node, from) => {
      const isNotary = workspace.notaries.indexOf(_node) !== -1;
      let entityNodes;
      if (isNotary) {
        // notaries are connected to all nodes (for now?)
        entityNodes = workspace.nodes.map(node=>node.safeName);
      } else {
        entityNodes = entities[from].nodes || [];
      }
      entityNodes.forEach(safeName => {
        const to = map[safeName];
        edges.push({from, to});
      });
    });
    const graph = {
      nodes,
      edges
    };
   
    const options = {
      layout: {
        improvedLayout: true,
        hierarchical: false
      },
      // randomSeed: "corda flavored ganache",
      edges: { 
        color: "#333",
        arrows: {
          to: {enabled: false},
          from: {enabled: false},
          middle: {enabled: false},
        },
        length: 200,
        selectionWidth: 0,
        width: 2
      },
      physics: {
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25
        }
      },
      nodes : {
        shape: 'dot',
        size: 25,
        color: {
          border: "#333",
          background: "#333",
          highlight: {
            background: "#888",
            border: "#888",
          }
        },
        borderWidth: 1,
        borderWidthSelected: 1
      }
    };
   
    const events = {
      select: (event) => {
        const selectedNode = event.nodes && event.nodes.length ? event.nodes[0] : 0;
        this.setState({selectedNode});
      }
    };

    return <Graph
      graph={graph}
      options={options}
      events={events}
      getNetwork={network => {
        //  if you want access to vis.js network api you can set the state in a parent component using this property
        network.on("stabilizationIterationsDone", function () {
          network.setOptions( { physics: false } );
        });
      }}
    />;
  }

  selectMode(mode) {
    return () => {
      this.setState({mode});
    }
  }

  emptyNetwork(){
    return (<div className="Waiting Waiting-Padded">No nodes or notaries configured.</div>);
  }

  render() {
    const entities = this.getEntities();
    const isEmptyNetwork = entities.length === 0;
    return (
      <div className="Nodes DataRows" style={{height: "100%"}}>
        <main style={{height: "100%", display: "flex", flexDirection: "column"}}>
          <div style={{fontWeight: "bold", color:"#444", fontSize: ".9em", padding:"1rem", borderBottom: "solid 1px rgba(0,0,0,.35)"}}>
            <span style={{paddingRight:"1rem", opacity:".5", textTransform: "uppercase" }}>View </span>
            <label style={{paddingRight:"1rem"}}><input type="checkbox" checked={this.state.mode==="list"} onChange={this.selectMode("list")} /> List</label>
            <label><input type="checkbox" checked={this.state.mode==="graph"} onChange={this.selectMode("graph")} /> Graph</label>
          </div>
          <div>
            {
              this.state.mode === "graph" ?
              (
                isEmptyNetwork ? this.emptyNetwork() : entities[this.state.selectedNode || 0]
              )
              : (
                isEmptyNetwork ? this.emptyNetwork() : entities
              )
            }
          </div>
          { this.state.mode === "list" ? "" : (<div style={{flexGrow: 1}}>{this.getGraph()}</div>) }
        </main>
      </div>
    );
  }
}

export default connect(
  Nodes,
  "config"
);
