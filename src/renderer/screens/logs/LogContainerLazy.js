import React, { Component } from "react";
import { List } from "react-virtualized";
import connect from "../helpers/connect";
import Row from "./Row";

class LogContainer extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const isLineLengthDiff =
      nextProps.logs.lines.length !== this.props.logs.lines.length;
    const isListHeightDiff = nextState.listHeight !== this.state.listHeight;

    return isLineLengthDiff || isListHeightDiff;
  }

  renderRow = ({ index, style }) => (
    <Row index={index} style={style} log={this.props.logs.lines[index]} />
  );

  render() {
    const { logs } = this.props;

    return (
      <div className="LogContainer" ref={this.LogContainer}>
        <ul>
          <List
            width={300}
            height={300} // TODO listen to window resize
            rowCount={logs.lines.length}
            rowHeight={35} // TODO needs to fit text, use variable size list?
            rowRenderer={this.renderRow}
          />
        </ul>
      </div>
    );
  }
}

export default connect(
  LogContainer,
  "logs",
);
