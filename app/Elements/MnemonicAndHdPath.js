import React, { Component } from 'react'

import Styles from './MnemonicAndHdPath.css'

export default class MnemonicAndHdPath extends Component {
  render () {
    return (
      <section className={Styles.MnemonicAndHdPath}>
        <div className={Styles.Mnemonic}>
          <h4>MNEMONIC</h4>
          <span>{this.props.mnemonic}</span>
        </div>
        <div className={Styles.HDPath}>
          <h4>HD PATH</h4>
          <span>{this.props.hdPath}account_index</span>
        </div>
      </section>
    )
  }
}
