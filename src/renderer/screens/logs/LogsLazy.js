import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import Row from "./Row";

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true,
});

class LogsLazy extends Component {
  shouldComponentUpdate(nextProps) {
    const isLineLengthDiff =
      nextProps.logs.lines.length !== this.props.logs.lines.length;

    return isLineLengthDiff;
  }

  renderRow = ({ index, style, parent }) => (
    <CellMeasurer
      cache={cache}
      columnIndex={0} // 0 for Lists
      key={index}
      rowIndex={index}
      parent={parent}
    >
      <Row index={index} style={style} log={this.props.logs.lines[index]} />
    </CellMeasurer>
  );

  clearCache = () => cache.clearAll();

  render() {
    const { logs } = this.props;

    return (
      <div className="LogContainer">
        <ul>
          <AutoSizer onResize={this.clearCache}>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={logs.lines.length}
                rowHeight={cache.rowHeight}
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
