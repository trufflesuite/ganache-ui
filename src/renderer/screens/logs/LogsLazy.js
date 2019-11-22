import React, { Component } from "react";
import {
  List,
  AutoSizer,
  CellMeasurer,
} from "react-virtualized";
import Row from "./Row";

class LogsLazy extends Component {
  shouldComponentUpdate(nextProps) {
    const isDifferentContext = nextProps.context !== this.props.context;
    if (isDifferentContext) { return true; }

    const isLineLengthDiff =
      nextProps.logs[this.props.context].lines.length !== this.props.logs[this.props.context].lines.length;

    return isLineLengthDiff;
  }

  renderRow = ({ index, style, parent }) => (
    <CellMeasurer
      cache={this.props.cache}
      columnIndex={0} // 0 for Lists
      key={index}
      rowIndex={index}
      parent={parent}
    >
      <Row index={index} style={style} log={this.props.logs[this.props.context].lines[index]} />
    </CellMeasurer>
  );

  clearCache = () => this.props.cache.clearAll();

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
                rowCount={logs[this.props.context].lines.length}
                rowHeight={this.props.cache.rowHeight}
                rowRenderer={this.renderRow}
              />
            )}
          </AutoSizer>
        </ul>
      </div>
    );
  }
}

export default LogsLazy;
