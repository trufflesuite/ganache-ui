import React, { Component } from "react";
import PropTypes from "prop-types";

export default class FormattedFILValue extends Component {
  render() {
    let attoFil;
    if (this.props.fromUnit === "fil") {
      // Using BigInt with the current versions of eslint
      // and babel-eslint require larger upgrades to both.
      // I chose not to do this currently as it may not be worth
      // the effort, especially if y'all are thinking of doing
      // a refactor
      // eslint-disable-next-line no-undef
      attoFil = BigInt(this.props.value) * 1000000000000000000n
    } else {
      // eslint-disable-next-line no-undef
      attoFil = BigInt(this.props.value);
    }

    let resultFil;
    if (this.props.toUnit === "fil") {
      resultFil = Number(attoFil * 100n / 1000000000000000000n) / 100;
    } else {
      resultFil = attoFil;
    }
    const value = resultFil.toFixed(2);
    return (
      <span
        title={value}
      >{`${value} ${this.props.toUnit.toUpperCase()}`}</span>
    );
  }
}

FormattedFILValue.propTypes = {
  value: PropTypes.string,
  fromUnit: PropTypes.string,
  toUnit: PropTypes.string,
};

FormattedFILValue.defaultProps = {
  fromUnit: "attofil",
  toUnit: "fil",
};
