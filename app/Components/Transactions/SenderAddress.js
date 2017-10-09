import React, { Component } from 'react'

import Styles from './MiniTxCard.css'

export default class SenderAddress extends Component {
  render () {
    return (
      <div className={Styles.From}>
        <div className={Styles.Label}>SENDER ADDRESS</div>
        <div className={Styles.Value}>
          {this.props.tx.from}
        </div>
      </div>
    )
  }
}
