import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";
import { getTerminal } from "../../../../common/redux/cordashell/actions";
require("xterm/css/xterm.css");

class Shell extends Component {
  constructor(props){
    super(props);
  }

  setup() {
    if (!Object.prototype.hasOwnProperty.call(this.props.cordashell, this.props.context)) {
      this.props.dispatch(getTerminal(this.props.context));
    } else {
      this.xtermRef.current.appendChild(this.props.cordashell[this.props.context].div);
    }
  }

  componentWillMount(){
    this.xtermRef = React.createRef();
  }

  componentDidMount(){
    this.setup();
  }

  componentDidUpdate(prevProps){
    if (this.props.context !== prevProps.context || this.props.cordashell[this.props.context] !== prevProps.cordashell[this.props.context]) {
      while (this.xtermRef.current && this.xtermRef.current.lastElementChild) {
        this.xtermRef.current.removeChild(this.xtermRef.current.lastElementChild);
      }
      this.setup();
    }
  }

  render() {
    const { context } = this.props;
    return (
      <div className="LogContainer">
        <ul>
          {context}
        </ul>
        <div ref={this.xtermRef}></div>
      </div>
    );
  }
}

export default connect(
  Shell,
  "config",
  "cordashell"
);
