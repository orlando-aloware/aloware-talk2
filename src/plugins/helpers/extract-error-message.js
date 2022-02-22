export default (err) => {
  const message = { data: err.message }

  if (err.response && err.response.data && err.response.data.errors) {
    message.data = []

    const errObject = err.response.data.errors

    Object.keys(errObject).forEach((k) => {
      message.data = message.data.concat(errObject[k])
    })

    return { message: message.data.join('<br />'), html: true }
  }

  if (err.response && err.response.data && err.response.data.message) {
    message.data = err.response.data.message
    return { message: message.data, html: false }
  }

  return { message: message.data, html: false }
}
