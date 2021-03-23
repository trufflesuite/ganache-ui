import React, { PureComponent } from "react";

import SeedInfoModal from "./SeedInfoModal";

import OnlyIf from "../../../../../renderer/components/only-if/OnlyIf";

export default class AccountsBanner extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showWarning: false,
    };
  }

  showWarning() {
    this.setState({
      showWarning: true,
    });
  }

  hideWarning() {
    this.setState({
      showWarning: false,
    });
  }

  render() {
    return (
      <section className="FilecoinAccountsBanner">
        <div className="Seed">
          <h4>
            SEED{" "}
            <span
              className="WarningIndicator"
              onClick={this.showWarning.bind(this)}
            >
              ?
            </span>
          </h4>
          <span>{this.props.seed}</span>
        </div>
        <OnlyIf test={this.state.showWarning == true}>
          <SeedInfoModal onCloseModal={this.hideWarning.bind(this)} />
        </OnlyIf>
      </section>
    );
  }
}
