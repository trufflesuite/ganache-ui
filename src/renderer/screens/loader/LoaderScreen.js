import React, { Component } from 'react'

import connect from '../helpers/connect'

class LoaderScreen extends Component {
  render () {
    return (
      <div className="LoaderScreenContainer">
        <div className="LoaderScreen">
          <div className="LogoWrapper">
            <div className="Logo FadeInElement"/>
          </div>
          <h4>
            <strong>
              Ganache
            </strong>
            <div className="GanacheVersion">
              v{this.state.version}
            </div>
          </h4>
        </div>
      </div>
    )
  }
}

export default connect(LoaderScreen)
