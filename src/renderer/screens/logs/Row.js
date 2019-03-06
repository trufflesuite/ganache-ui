import React from "react";

const Row = ({ index, style, log }) => (
  <li key={index} className="plain" style={style}>
    {`[${new Date(log.time).toLocaleTimeString()}]`} {log.line}
  </li>
);

export default Row;
