export default function validateChange (VALIDATIONS, component, e) {
  const name = e.target.name
  const value = e.target.value

  console.log(name, value)

  const validation = VALIDATIONS[name]

  let hasValidationError = false

  if (validation.canBeBlank && value === '') {
    component.props.handleInputChange(e)
    return true
  }

  if (validation.allowedChars) {
    component.setState({
      [`${name}ValidationError`]: !value.match(validation.allowedChars)
    })

    if (!value.match(validation.allowedChars)) {
      // We return true as the validation is true since we prevented the invalid
      // character from being added.
      return true
    }
  }

  if (validation.format) {
    hasValidationError = hasValidationError || !value.match(validation.format)
  }

  if (validation.min) {
    hasValidationError =
      hasValidationError ||
      parseInt(value, 10) < validation.min ||
      isNaN(parseInt(value, 10))
  }

  if (validation.max) {
    hasValidationError =
      hasValidationError || parseInt(value, 10) > validation.max
  }

  component.setState({
    [`${name}ValidationError`]: hasValidationError
  })

  component.props.handleInputChange(e)

  return !hasValidationError
}
