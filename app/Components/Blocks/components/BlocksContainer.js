import React, { Component } from 'react'

import Styles from './Blocks.css'

export default class BlocksContainer extends Component {
  render () {
    return (
      <div className={Styles.Blocks}>
        {this.props.children}
      </div>
    )
  }
}
