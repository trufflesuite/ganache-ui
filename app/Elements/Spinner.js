import React, { PureComponent } from 'react'

class Spinner extends PureComponent {
  render () {
    return (
        <svg width={this.props.width} height={this.props.height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="uil-ring-alt">
          <rect x="0" y="0" width="100" height="100" fill="none" className="bk"></rect>
          <circle cx="50" cy="50" r="40" stroke="rgba(29, 31, 46, 1)" fill="none" strokeWidth="10" strokeLinecap="round"></circle>
          <circle cx="50" cy="50" r="40" stroke="rgba(230, 167, 99, 1.000)" fill="none" strokeWidth="6" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" dur="2s" repeatCount="indefinite" from="0" to="502"></animate>
            <animate attributeName="stroke-dasharray" dur="2s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate>
          </circle>
        </svg>
    )
  }
}

export default Spinner
