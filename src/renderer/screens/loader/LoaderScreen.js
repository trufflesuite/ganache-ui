import React, { Component } from 'react'

import MDSpinner from "react-md-spinner";
import connect from '../helpers/connect'

class LoaderScreen extends Component {
  render () {
    return (
      <div className="LoaderScreenContainer">
        <div className="LoaderScreen">
          <MDSpinner
            singleColor="var(--primary-color)"
            size={200}
            borderSize={3}
            className="spinner"
            duration={2666}
          />
          <div className="LogoWrapper">
            <div className="Logo FadeInElement"/>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(LoaderScreen)
