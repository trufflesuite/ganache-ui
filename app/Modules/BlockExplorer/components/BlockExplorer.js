import React, { Component } from 'react'

import Styles from './BlockExplorer.css'

export default class BlockExplorer extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return this.props.testRpcState.blocks.length !== nextProps.testRpcState.blocks.length
  }

  render () {
    return (
      <div className={Styles.BlockExplorer}>
        <div className={Styles.Blocks}>
          <h4>BLOCKS ({this.props.testRpcState.blocks.length})</h4>
          <main>
            <ul>
              {
                this.props.testRpcState.blocks.map((block) => {
                  return (
                    <li key={block.header.stateRoot}>
                      <dl className={Styles.BlockData}>
                        <dt>Number</dt>
                        <dd>{block.header.number}</dd>
                        <dt>Hash</dt>
                        <dd>{block.header.hash}</dd>
                        <dt>Mined On</dt>
                        <dd>{block.header.timestamp}</dd>
                        <dt>Gas Used / Gas Limit</dt>
                        <dd>{block.header.gasUsed} / {block.header.gasLimit}</dd>
                        <dt>Size</dt>
                        <dd>{block.header.size} bytes</dd>
                        <dt>Total Difficulty</dt>
                        <dd>{block.header.difficulty}</dd>
                        <dt>Parent Hash</dt>
                        <dd>{block.header.parentHash}</dd>
                        <dt>Nonce</dt>
                        <dd>{block.header.nonce}</dd>
                        <dt>Receipts Root</dt>
                        <dd>{block.header.receiptTrie}</dd>
                        <dt>State Root</dt>
                        <dd>{block.header.stateRoot}</dd>
                        <dt>Bloom</dt>
                        <dd>{block.header.bloom}</dd>
                        <dt>Extra Data</dt>
                        <dd><pre>{block.header.extraData}</pre></dd>
                      </dl>
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
