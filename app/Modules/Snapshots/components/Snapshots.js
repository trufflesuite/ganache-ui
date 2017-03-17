import React, { Component } from 'react'
import Styles from './Snapshots.css'

export default class Snapshots extends Component {
  render () {
    return (
      <div className={Styles.Snapshots}>
        <h4>SNAPSHOTS</h4>
        <main>
          <table>
            <thead>
              <tr>
                <td>INDEX</td>
                <td>CREATION DATE</td>
              </tr>
            </thead>
            <tbody>
              {
                this.props.testRpcState.snapshots.map((snapshot) => {
                  return (
                    <tr>
                      <td>
                        { JSON.stringify(snapshot) }
                      </td>
                      <td></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </main>
        <footer>
        </footer>
      </div>
    )
  }
}
