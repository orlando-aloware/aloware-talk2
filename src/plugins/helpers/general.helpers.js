/**
 * Clone object by JSON Stringify then Parse
 * @param {*} value
 * @returns {string}
 */
const jsonClone = (value) => {
  if (value) {
    return JSON.parse(JSON.stringify(value))
  }

  return value
}

export default ({ Vue }) => {
  const filters = {
    jsonClone
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
