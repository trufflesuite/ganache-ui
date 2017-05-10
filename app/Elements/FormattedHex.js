import React, { Component } from 'react'
import EtherUtil from 'ethereumjs-util'

export default class FormattedHex extends Component {
  render () {
    if (EtherUtil.bufferToHex(this.props.value) === '0x') {
      return (
        <span title='0'>0x0</span>
      )
    }

    return <span title={EtherUtil.bufferToInt(this.props.value)}>{EtherUtil.bufferToHex(this.props.value)}</span>
  }
}
