import React, { Component } from "react";
import { FixedSizeList } from "react-window";
import connect from "../helpers/connect";
import Row from "./Row";

class LogContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.logs.lines.length !== this.props.logs.lines.length;
  }

  renderRow = ({ index }) => (
    <Row index={index} log={this.props.logs.lines[index]} />
  );

  render() {
    const { logs } = this.props;

    return (
      <div className="LogContainer">
        <FixedSizeList
          height={150}
          itemSize={35}
          width={300}
          itemCount={logs.lines.length}
        >
          {this.renderRow}
        </FixedSizeList>
      </div>
    );
  }
}

export default connect(
  LogContainer,
  "logs",
);
