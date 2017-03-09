import React, { Component } from 'react'
import Moment from 'react-moment'
import EtherUtil from 'ethereumjs-util'

import Styles from './BlockExplorer.css'

export default class BlockExplorer extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return true
    // console.log(this.props.testRpcState.blocks)
    // return this.props.testRpcState.blocks[0].header.number !== nextProps.testRpcState.blocks[0].header.number
  }

  _renderRecentTransaction = (transactions) => {
    if (transactions.length === 0) {
      return "NO TRANSACTIONS"
    }

    return transactions.map((tx) => {
      return EtherUtil.bufferToHex(tx.hash)
    })
  }

  render () {
    return (
      <div className={Styles.BlockExplorer}>
        <div className={Styles.Blocks}>
          <h4>LAST 5 BLOCKS</h4>
          <main>
            <ul className={Styles.BlockList}>
              {
                this.props.testRpcState.blocks.map((block) => {
                  return (
                    <li className={Styles.Block} key={block.header.stateRoot}>
                      <span className={Styles.BlockNumber}>
                        <p>Block Number</p>
                        {block.header.number}
                      </span>
                      <table className={Styles.BlockData}>
                        <tr>
                          <td>
                            <dl>
                              <dt>Block Hash</dt>
                              <dd>{EtherUtil.bufferToHex(block.hash)}</dd>
                            </dl>
                          </td>
                          <td>
                            <dl>
                              <dt>Parent Hash</dt>
                              <dd>{EtherUtil.bufferToHex(block.header.parentHash)}</dd>
                            </dl>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <dl>
                              <dt>Mined On</dt>
                              <dd><Moment unix>{EtherUtil.bufferToInt(block.header.timestamp)}</Moment></dd>
                            </dl>
                          </td>
                          <td>
                            <dl>
                              <dt>Gas Used / Gas Limit</dt>
                              <dd>{EtherUtil.bufferToHex(block.header.gasUsed)} / {EtherUtil.bufferToHex(block.header.gasLimit)}</dd>
                            </dl>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <dl>
                              <dt>Mix Hash</dt>
                              <dd>{EtherUtil.bufferToHex(block.header.mixHash)}</dd>
                            </dl>
                          </td>
                          <td>
                            <dl>
                              <dt>Receipts Root</dt>
                              <dd>{EtherUtil.bufferToHex(block.header.receiptTrie)}</dd>
                            </dl>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <dl>
                              <dt>Nonce</dt>
                              <dd>{EtherUtil.bufferToHex(block.header.nonce)}</dd>
                            </dl>
                          </td>
                          <td>
                            <dl>
                              <dt>State Root</dt>
                              <dd>{EtherUtil.bufferToHex(block.header.stateRoot)}</dd>
                            </dl>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <dl>
                              <dt>Bloom</dt>
                              <dd className={Styles.Bloom}>{EtherUtil.bufferToHex(block.header.bloom)}</dd>
                            </dl>
                          </td>
                          <td>
                            <dl>
                              <dt>Transactions ({block.transactions.length})</dt>
                              <dd>{
                                this._renderRecentTransaction(block.transactions)
                              }</dd>
                            </dl>
                            <dl>
                              <dt>Extra Data</dt>
                              <dd><pre>{EtherUtil.bufferToHex(block.header.extraData)}</pre></dd>
                            </dl>
                          </td>
                        </tr>
                      </table>
                    </li>
                  )
                })
              }
            </ul>
          </main>
          <footer>
          </footer>
        </div>
        <div className={Styles.Transactions}>
          <h4>TRANSACTIONS ({Object.keys(this.props.testRpcState.transactions).length})</h4>
          <main>
          </main>
          <footer>
          </footer>
        </div>
      </div>
    )
  }
}
