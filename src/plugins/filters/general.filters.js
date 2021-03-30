import _ from 'lodash'
import * as CampaignCallRouterBehavior from '../../constants/campaign-call-router-behaviors'
import * as AgentStatus from '../../constants/agent-status'

// general
const toUpperCase = (text) => {
  if (text) {
    return text.toUpperCase()
  } else {
    return ''
  }
}

const capitalize = (text) => {
  if (text) {
    return _.capitalize(text)
  } else {
    return ''
  }
}

const initials = (name) => {
  let initials = name.match(/\b\w/g) || []
  initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()

  return initials
}

const humanReadableBool = (boolValue) => {
  if (boolValue) {
    return 'On'
  } else {
    return 'Off'
  }
}

const humanReadableDialMode = (mode) => {
  switch (mode) {
    case 0:
      return 'Simultaneous'
    case 1:
      return 'Sequential'
    case 2:
      return 'Round-robin'
  }
  return '-'
}

const humanReadableCallRouterBehavior = (mode) => {
  switch (mode) {
    case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_FAST_FORWARD:
      return 'Fast Forward'
    case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_SMART_QUEUE:
      return 'Smart Queue'
    case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_DEAD_END:
      return 'Dead End'
    case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_IVR:
      return 'IVR'
  }
  return '-'
}

const ucfirst = (string) => {
  if (!string) {
    return '-'
  } else {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}

const checkIfEmpty = (value) => {
  if (!value) {
    return '-'
  } else {
    return value
  }
}

const checkIfTrue = (value) => {
  if (!value) {
    return '<i class="material-icons">&#xE876;</i>'
  } else {
    return '<i class="material-icons">&#xE14C;</i>'
  }
}

const prettifyCamelCase = (value) => {
  let output = ''
  let len = value.length
  let char

  for (let i = 0; i < len; i++) {
    char = value.charAt(i)

    if (i === 0) {
      output += char.toUpperCase()
    } else if (char !== char.toLowerCase() && char === char.toUpperCase()) {
      output += ' ' + char
    } else if (char === '-' || char === '_') {
      output += ' '
    } else {
      output += char
    }
  }

  return output
}

const ucwords = (value) => {
  return (value + '')
    .replace(/^(.)|\s+(.)/g, function ($1) {
      return $1.toUpperCase()
    })
}

const filterDomain = (email) => {
  if (email) {
    return email.replace(/.*@/, '')
  } else {
    return '-'
  }
}

const fixCompanyRole = (label) => {
  if (label) {
    return label.replace('Company ', '')
  } else {
    return '-'
  }
}

const truncate = (text, stop, clamp) => {
  return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
}

const toInt = (amount) => {
  if (amount !== undefined) {
    return parseInt(amount)
  } else {
    return '-'
  }
}

const fixOrder = (order) => {
  if (order !== '' && order !== undefined) {
    return parseInt(order) + 1
  } else {
    return '-'
  }
}

const pretty = (value) => {
  if (value) {
    return JSON.stringify(value, null, 3)
  } else {
    return ''
  }
}

const firstName = (fullName) => {
  if (fullName) {
    if (fullName.indexOf(' ') > -1) {
      let nameArr = fullName.split(/\s+/)
      return nameArr.slice(0, -1).join(' ')
    } else {
      return fullName
    }
  }

  return ''
}

const lastName = (fullName) => {
  if (fullName) {
    if (fullName.indexOf(' ') > -1) {
      let nameArr = fullName.split(/\s+/)
      return nameArr.pop()
    } else {
      return fullName
    }
  }

  return ''
}

const replaceDash = (text) => {
  if (text) {
    return text.replace('-', ' ')
  } else {
    return ''
  }
}

const agentStatusClass = (agentStatus) => {
  agentStatus = parseInt(agentStatus)
  if (agentStatus !== null) {
    switch (agentStatus) {
      case AgentStatus.AGENT_STATUS_OFFLINE:
        return 'bg-blue-grey-6'
      case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
        return 'bg-green-6'
      case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
        return 'bg-red-6'
      case AgentStatus.AGENT_STATUS_ON_BREAK:
        return 'bg-orange-6'
      case AgentStatus.AGENT_STATUS_ON_CALL:
        return 'bg-light-blue-6'
      case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
        return 'bg-yellow-6'
      case AgentStatus.AGENT_STATUS_RINGING:
        return 'bg-lime-13'
      case AgentStatus.AGENT_STATUS_AUTO_DIAL:
        return 'bg-white'
      case AgentStatus.AGENT_STATUS_SENTRY:
        return 'bg-dark'
      default:
        return 'bg-grey-6'
    }
  }

  return 'bg-grey-6'
}

export default ({ Vue }) => {
  const filters = {
    toUpperCase,
    capitalize,
    initials,
    humanReadableBool,
    humanReadableDialMode,
    humanReadableCallRouterBehavior,
    ucfirst,
    checkIfEmpty,
    checkIfTrue,
    prettifyCamelCase,
    ucwords,
    filterDomain,
    fixCompanyRole,
    truncate,
    toInt,
    fixOrder,
    pretty,
    firstName,
    lastName,
    replaceDash,
    agentStatusClass
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
