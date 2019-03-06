import React, { Component } from "react";
import { FixedSizeList } from "react-window";
import connect from "../helpers/connect";
import Row from "./Row";

class LogContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listHeight: 0,
    };

    this.LogContainer = React.createRef();
  }

  componentDidMount() {
    this.setState({ listHeight: this.LogContainer.current.clientHeight });
  }

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
    const { listHeight } = this.state;

    return (
      <div className="LogContainer" ref={this.LogContainer}>
        <ul>
          <FixedSizeList
            className="LazyList"
            height={listHeight}
            itemSize={35}
            width="100%"
            itemCount={logs.lines.length}
          >
            {this.renderRow}
          </FixedSizeList>
        </ul>
      </div>
    );
  }
}

export default connect(
  LogContainer,
  "logs",
);
