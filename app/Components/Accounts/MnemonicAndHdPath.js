import React, { PureComponent } from 'react'

export default class MnemonicAndHdPath extends PureComponent {
  shouldComponentUpdate (nextProps, nextState) {
    return (
      nextProps.mnemonic !== this.props.mnemonic ||
      nextProps.hdPath !== this.props.hdPath
    )
  }

  render () {
    return (
      <section className="MnemonicAndHdPath">
        <div className="Mnemonic">
          <h4>MNEMONIC</h4>
          <span>
            {this.props.mnemonic}
          </span>
        </div>
        <div className="HDPath">
          <h4>HD PATH</h4>
          <span>
            {this.props.hdPath}account_index
          </span>
        </div>
      </section>
    )
  }
}
