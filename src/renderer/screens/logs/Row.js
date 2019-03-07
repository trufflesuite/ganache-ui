import React from "react";
import PropTypes from "prop-types";

const Row = ({ index, log, style }) => (
  <li key={index} className="plain" style={style}>
    {`[${new Date(log.time).toLocaleTimeString()}]`} {log.line}
  </li>
);

Row.propTypes = {
  index: PropTypes.number,
  log: PropTypes.shape({
    time: PropTypes.instanceOf(Date).isRequired,
    line: PropTypes.string.isRequired,
  }).isRequired,
  style: PropTypes.object, // required by react-virtualized
};

export default Row;
