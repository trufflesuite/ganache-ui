import React, { Component } from 'react'
import InputText from 'Elements/InputText'
import LogContainer from 'Elements/LogContainer'
import Styles from './Repl.css'

import ReplProvider from 'Data/Providers/ReplProvider'

const UP_ARROW_KEY = 38
const DOWN_ARROW_KEY = 40
const TAB_KEY = 9

class Repl extends Component {
  constructor () {
    super()

    this.buffer = []
    this.state = {
      currentLine: '',
      commandHistory: [],
      commandHistoryIndex: 0,
      completionIndex: 0
    }
  }

  _handleReplInput = (value) => {
    this.props.appSendReplCommand(value)
    this.setState({currentLine: '', commandHistory: this.state.commandHistory.concat(value)})
  }

  _handleChange = (value) => {
    this.setState({currentLine: value})
    this.props.appSendReplCommandCompletion(value)
  }

  _handleKeyDown = (e) => {
    const keyCode = e.keyCode

    if (keyCode === UP_ARROW_KEY) {
      e.preventDefault()
      this._goForwardInCommandHistory()
    } else if (keyCode === DOWN_ARROW_KEY) {
      e.preventDefault()
      this._goBackwardsInCommandHistory()
    } else if (keyCode === TAB_KEY) {
      e.preventDefault()

      const completions = this.props.repl.commandCompletions
      const currentLine = this.state.currentLine

      if (completions.length === 1) {
        this.setState({currentLine: currentLine + this._lettersToAppend(currentLine, completions[0])})
      } else {
        var possibles = []
        for (var j = 0; j < completions.length; j++) {
          if (completions[j] !== '') {
            possibles.push(completions[j])
          }
        }

        var expansion = this._getCommonPrefix(possibles)
        if (expansion.length > 0) {
          this.setState({ currentLine: currentLine + this._lettersToAppend(currentLine, expansion) })
        }
      }
    }
  }

  _getCommonPrefix = (words) => {
    if (words.length === 0) return ''
    if (words.length === 1) return words[0]
    var prefix = words[0]
    for (var i = 1; i < words.length; ++i) {
      var _p = ''
      var minLen = Math.min(prefix.length, words[i].length)
      for (var j = 0; j < minLen && prefix[j] === words[i][j]; ++j) {
        _p += prefix[j]
      }
      prefix = _p
    }
    return prefix
  }

  _lettersToAppend = (word1, word2) => {
    var word1Matched = 0
    for (var i = 0; i < word1.length + word2.length; i++) {
      if (word1[i] === word2[word1Matched]) {
        word1Matched++
        if ((i + 1) === word1.length) {
          return word2.substring(word1Matched)
        }
      } else {
        word1Matched = 0
      }
    }
  }

  _longestInCommon = (candidates, index) => {
    var i, ch, memo
    do {
      memo = null
      for (i = 0; i < candidates.length; i++) {
        ch = candidates[i].charAt(index)
        if (!ch) break
        if (!memo) memo = ch
        else if (ch !== memo) break
      }
    } while (i === candidates.length && ++index)
    return candidates[0].slice(0, index)
  }

  _goForwardInCommandHistory = () => {
    if (this.state.commandHistoryIndex < this.state.commandHistory.length) {
      this.setState({
        currentLine: this.state.commandHistory[this.state.commandHistoryIndex],
        commandHistoryIndex: this.state.commandHistoryIndex + 1
      })
    }
  }

  _goBackwardsInCommandHistory = () => {
    if (this.state.commandHistoryIndex > 0) {
      this.setState({
        currentLine: this.state.commandHistory[this.state.commandHistoryIndex - 1],
        commandHistoryIndex: this.state.commandHistoryIndex - 1
      })
    }
  }

  render () {
    return (
      <div className={Styles.Repl}>
        <h4>REPL</h4>
        <main>
          <LogContainer logs={this.props.repl.replBuffer} />
        </main>
        <footer>
          <InputText
            delay={0}
            value={this.state.currentLine}
            onEnter={this._handleReplInput}
            onChange={this._handleChange}
            onKeyDown={this._handleKeyDown}
            placeholder={'$'}
          />
        </footer>
      </div>
    )
  }
}

export default ReplProvider(Repl)
