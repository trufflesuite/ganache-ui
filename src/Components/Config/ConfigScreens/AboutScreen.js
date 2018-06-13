import React, { Component } from 'react'
import * as pkg from '../../../../package.json'

class AccountsScreen extends Component {
  render () {
    return (
      <div className="AboutScreenContainer">
        <div className="AboutScreen">
          <div className="LogoWrapper">
            <div className="Logo"/>
          </div>
          <h4>
            <strong>
              Ganache
            </strong>
            <div className="GanacheVersion">
              v{pkg.version}
            </div>
          </h4>
          <div className="GanacheDescription">
            Ganache is created and maintained with <span className="heart">♥</span> by <a href="http://truffleframework.com">Truffle</a><br/>
            Please check the status of or report any bugs or feature requests on <a href="https://github.com/trufflesuite/ganache/issues">GitHub</a>
          </div>
        </div>
      </div>
    )
  }
}

export default AccountsScreen
