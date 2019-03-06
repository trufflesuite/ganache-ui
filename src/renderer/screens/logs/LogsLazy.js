import React, { Component } from "react";
import PropTypes from "prop-types";
import { List, AutoSizer } from "react-virtualized";
import Row from "./Row";

class LogsLazy extends Component {
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
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={logs.lines.length}
                rowHeight={35} // TODO needs to fit text, use variable size list?
                rowRenderer={this.renderRow}
              />
            )}
          </AutoSizer>
        </ul>
      </div>
    );
  }
}

LogsLazy.defaultProps = {
  logs: {
    lines: [],
  },
};

LogsLazy.propTypes = {
  logs: PropTypes.shape({
    lines: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default LogsLazy;
