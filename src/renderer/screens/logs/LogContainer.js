import React, { Component } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import connect from "../helpers/connect";

class LogContainer extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.logs.lines.length !== this.props.logs.lines.length;
  }

  UNSAFE_componentWillUpdate() {
    var pixelBuffer = 10;
    var node = this.LogItems;
    this.shouldScrollBottom =
      node.scrollTop + node.offsetHeight >= node.scrollHeight - pixelBuffer;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.LogItems.scrollTop = this.LogItems.scrollHeight;
    }
  }

  componentDidMount() {
    this.LogItems.scrollTop = this.LogItems.scrollHeight;
  }

  render() {
    return (
      <div className="LogContainer">
        <ul ref={el => (this.LogItems = el)}>
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
