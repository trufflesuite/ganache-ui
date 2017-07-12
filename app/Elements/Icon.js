import React, {PropTypes} from 'react'

import icons from './_getIcons'

export default function Icon (props) {
  let {color, size, name, ...more} = props
  delete more.className
  delete more.style

  let divStyle = {
    display: 'inline-block',
    height: size,
    width: size
  }

  let svgStyle = {}
  if (name.includes('filled')) {
    svgStyle.fill = color
  } else {
    svgStyle.stroke = color
  }

  // Remove any stroke/fill colors that may have been specified in the SVG
  let html = icons[name].replace(/stroke="(.*?)"/g, 'stroke="currentColor"')

  return (
    <div style={divStyle}>
      <svg
        {...more}
        viewBox={`0 0 ${size} ${size}`}
        style={svgStyle}
        dangerouslySetInnerHTML={{__html: html}}
      />
    </div>
  )
}

Icon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  name: PropTypes.string.isRequired
}

Icon.defaultProps = {
  color: '#3c3c3c',
  size: 24
}
