import React, { Component } from 'react'
import SearchIcon from 'Icons/search.svg'
import Icon from 'Elements/Icon'
import Styles from './NotFoundScreen.css'

class NotFoundScreen extends Component {  
  render () {
    return (
      <div className={Styles.NotFound}>
        <main>
          <Icon glyph={SearchIcon} size={64} />
          <p>
            Nothing found. 
          </p>
        </main>
      </div>
    )
  }
}

export default NotFoundScreen