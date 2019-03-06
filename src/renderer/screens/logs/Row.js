import React from "react";

const Row = ({ index, log }) => (
  <li key={index} className="plain">
    {`[${new Date(log.time).toLocaleTimeString()}]`} {log.line}
  </li>
);

export default Row;
