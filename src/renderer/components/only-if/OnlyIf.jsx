import { PureComponent } from "react";

class OnlyIf extends PureComponent {
  render() {
    return this.props.test ? this.props.children : null;
  }
}

export default OnlyIf;
