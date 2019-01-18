import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import connect from "../helpers/connect";

class LogContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.logs.lines.length !== this.props.logs.lines.length;
  }

  componentWillUpdate() {
    var pixelBuffer = 10;
    var node = this.refs.LogItems;
    this.shouldScrollBottom =
      node.scrollTop + node.offsetHeight >= node.scrollHeight - pixelBuffer;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.refs.LogItems.scrollTop = this.refs.LogItems.scrollHeight;
    }
  }

  componentDidMount() {
    this.refs.LogItems.scrollTop = this.refs.LogItems.scrollHeight;
  }

  render() {
    return (
      <div className="LogContainer" ref="LogContainer">
        <ul ref="LogItems">
          <Scrollbars
            className="scrollBar"
            renderThumbVertical={props => (
              <div {...props} className="scroll-light" />
            )}
          >
            {this.props.logs.lines.map((log, index) => {
              return (
                <li key={index} className="plain">
                  {`[${new Date(log.time).toLocaleTimeString()}]`} {log.line}
                </li>
              );
            })}
          </Scrollbars>
        </ul>
      </div>
    );
  }
}

export default connect(
  LogContainer,
  "logs",
);
