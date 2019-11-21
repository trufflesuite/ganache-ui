module.exports = function pojofyError(_error) {
  let error;
  if (_error instanceof Error) {
    // JSON.stringify can't serialize error objects
    // so we just convert the Error to an Object here
    error = {};

    Object.getOwnPropertyNames(_error).forEach((key) => {
      error[key] = _error[key];
    });
  } else {
    error = _error;
  }
  return error;
}
