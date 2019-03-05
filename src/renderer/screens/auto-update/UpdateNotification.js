import React, { Component } from "react";

import connect from "../helpers/connect";

import { showUpdateModal } from "../../../common/redux/auto-update/actions";

import UpdateIcon from "../../icons/chevron-up-o.svg";

class UpdateNotification extends Component {
  constructor() {
    super();
    this.state = {};
  }

  handleUpdateClick() {
    this.props.dispatch(showUpdateModal());
  }

  render() {
    return (
      <div className="UpdateNotification">
        <a className="UpdateBtn" onClick={this.handleUpdateClick.bind(this)}>
          <UpdateIcon /> Update Available
        </a>
      </div>
    );
  }
}

export default connect(UpdateNotification);
