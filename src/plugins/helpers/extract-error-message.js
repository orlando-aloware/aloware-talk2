export default (err) => {
  let message = err.message

  if (err.response.data && err.response.data.errors) {
    message = []

    const errObject = err.response.data.errors

    Object.keys(errObject).forEach((k) => {
      message = message.concat(errObject[k])
    })

    return { message: message.join('<br />'), html: true }
  }

  if (err.response.data && err.response.data.message) {
    message = err.response.data.message
    return { message, html: false }
  }

  return { message, html: false }
}
