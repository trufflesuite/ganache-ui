import React, { Component } from 'react'
import connect from 'Components/Helpers/connect'

import OnlyIf from 'Elements/OnlyIf'

import Styles from '../ConfigScreen.css'

class AccountsScreen extends Component {
  render () {
    return (
      <div>
        <h2>FORK CHAIN</h2>
        <section>
          <h4>ENABLE CHAIN FORKING</h4>
          <div className={Styles.Row}>
            <div className={Styles.RowItem}>
              <div className="Switch">
                <input
                  type="checkbox"
                  name="forkChain"
                  id="ForkChain"
                  onChange={this.props.handleInputChange}
                  checked={this.props.formState.forkChain}
                />
                <label htmlFor="ForkChain">FORK CHAIN</label>
              </div>
            </div>
            <div className={Styles.RowItem}>
              <p>Fork a chain and use it for the initial starting point.</p>
            </div>
          </div>
        </section>
        <section>
          <OnlyIf test={this.props.formState.forkChain}>
            <div className={Styles.Row}>
              <div className={Styles.RowItem}>
                <input
                  type="text"
                  name="fork"
                  placeholder="URL to target Chain"
                  value={this.props.formState.fork}
                  onChange={this.props.handleInputChange}
                />
              </div>
              <div className={Styles.RowItem}>
                <p>A URL pointing to the chain to fork.</p>
              </div>
            </div>
          </OnlyIf>
        </section>
      </div>
    )
  }
}

export default connect(AccountsScreen, "settings")
