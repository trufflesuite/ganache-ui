import connect from "../../../../renderer/screens/helpers/connect";
import React, { Component } from "react";
import { getTerminal, SSH_RESIZE } from "../../../../common/redux/cordashell/actions";
import { ipcRenderer } from "electron";
require("xterm/css/xterm.css");

const aVar = "";
class Shell extends Component {
  constructor(props){
    super(props);
    this.sshResizeListener = this.sshResizeListener.bind(this);
  }

  sshResizeListener(){
    const term = this.props.cordashell[this.props.context + aVar];
    if (term) {
      term.fitAddon.fit();
      ipcRenderer.send(SSH_RESIZE, {rows: term.rows, cols: term.cols});
    }
  }

  setup() {
    if (!Object.prototype.hasOwnProperty.call(this.props.cordashell, this.props.context + aVar)) {
      this.props.dispatch(getTerminal(this.props.context + aVar));
    } else {
      const term = this.props.cordashell[this.props.context + aVar];
      this.xtermRef.current.appendChild(term.div);
      if (!term._isOpened) {
        term.open(term.div);
        term._isOpened = true;
      }
      this.sshResizeListener();
      term.focus();
    }
  }

  componentWillMount(){
    this.xtermRef = React.createRef();
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.sshResizeListener);
  }

  componentDidMount(){
    window.addEventListener('resize', this.sshResizeListener, false);
    this.setup();
  }

  componentDidUpdate(prevProps){
    if (this.props.context !== prevProps.context || this.props.cordashell[this.props.context + aVar] !== prevProps.cordashell[this.props.context+aVar]) {
      // this.xtermRef.current.hasChildNodes()
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
        <div ref={this.xtermRef} className="xtermContainer"></div>
      </div>
    );
  }
}

export default connect(
  Shell,
  "config",
  "cordashell"
);
