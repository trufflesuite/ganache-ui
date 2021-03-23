import React, { PureComponent } from "react";

import Styles from "./HeaderBar.css";

export default class HeaderBar extends PureComponent {
  render() {
    return <header className={Styles.Header}>{this.props.children}</header>;
  }
}
