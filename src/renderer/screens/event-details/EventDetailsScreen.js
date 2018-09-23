import React from "react"

export default props => {
  const { logIndex, transactionHash } = props.routeParams
  console.log(logIndex, transactionHash)
  return <div>This is the event details screen</div>
}
