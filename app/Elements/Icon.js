import React from 'react'
import styled from 'styled-components'

const Icon = styled.svg`
  color: inherit;
  fill: currentColor;
  stroke: currentColor;
  margin-right: .5rem;
  stroke-width: 4;
`

export default ({ glyph, size }) => (
  <Icon viewBox={`${glyph.viewBox}`} width={size} height={size}>
    <use xlinkHref={`#${glyph.id}`} />
  </Icon>
)
