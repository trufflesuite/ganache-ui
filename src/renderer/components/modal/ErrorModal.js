import React, { PureComponent } from "react";

import Modal from "./Modal";
import ModalDetails from "./ModalDetails.js";
import connect from "../../screens/helpers/connect";

// TODO: make an actual warning and error icons
import WarningIcon from "../../icons/warning.svg";
import ErrorIcon from "../../icons/error.svg";

class ErrorModal extends PureComponent {
  close() {
    this.props.dispatch(ModalDetails.actions.dismissModalError());
  }

  render() {
    const data = this.props.modalError.data;
    const buttons = (data.buttons || []).map(button => {
      return (
        <button
          key={button.value}
          onClick={() => {
            (button.click || this.close.bind(this))(this);
          }}
        >
          {button.value}
        </button>
      );
    });

    let subTitle;
    let icon;
    switch (data.type) {
      case ModalDetails.types.WARNING:
        subTitle = "WARNING";
        icon = <WarningIcon />;
        break;
      case ModalDetails.types.ERROR:
        console.error(this.props.modalError);
        subTitle = "ERROR";
        icon = <ErrorIcon />;
        break;
    }

    return (
      <Modal className="ErrorModal">
        <header>
          <h4>{data.title}</h4>
          <button onClick={this.close.bind(this)}>X</button>
        </header>
        <section className="subTitle">
          {icon} {subTitle}
        </section>
        <section>
          <p>{data.message}</p>
          <footer>{buttons}</footer>
        </section>
      </Modal>
    );
  }
}

export default connect(ErrorModal);
