export default function validateChange (VALIDATIONS, component, e) {
  const name = e.target.name
  const value = e.target.value

  console.log(name, value)

  const validation = VALIDATIONS[name]

  let validationError = false

  if (validation.allowedChars) {
    component.setState({
      [`${name}ValidationError`]: !value.match(validation.allowedChars)
    })

    if (!value.match(validation.allowedChars)) {
      return
    }
  }

  if (validation.format) {
    validationError = validationError || !value.match(validation.format)
  }

  if (validation.min) {
    validationError =
      validationError ||
      parseInt(value, 10) < validation.min ||
      isNaN(parseInt(value, 10))
  }

  if (validation.max) {
    validationError = validationError || parseInt(value, 10) > validation.max
  }

  component.setState({
    [`${name}ValidationError`]: validationError
  })

  component.props.handleInputChange(e)
}
