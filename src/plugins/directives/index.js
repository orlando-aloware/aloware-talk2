import cleave from './cleave.directive'
import focus from './focus.directive'
import holdpress from './holdpress.directive'
import linkify from './linkify.directive'
import longpress from './longpress.directive'

export default async ({ Vue }) => {
  const directives = {
    cleave,
    focus,
    linkify,
    holdpress,
    longpress
  }

  window.$directives = directives

  Object.keys(directives).map(k => {
    Vue.directive(k, directives[k])
  })
}
