const fixResourceName = (type) => {
  switch (type) {
    case 'subaccount_local_pn':
      return 'Subaccount Local Phone Numbers'
    case 'local_pn':
      return 'Local Phone Numbers'
    case 'subaccount_tollfree_pn':
      return 'Subaccount Toll-free Phone Numbers'
    case 'tollfree_pn':
      return 'Toll-free Phone Numbers'
    case 'subaccount_local_min':
      return 'Subaccount Local Minutes'
    case 'local_min':
      return 'Local Minutes'
    case 'subaccount_tollfree_min':
      return 'Subaccount Toll-free Minutes'
    case 'tollfree_min':
      return 'Toll-free Minutes'
    case 'subaccount_sms':
      return 'Subaccount Text Messages'
    case 'sms':
      return 'Text Messages'
    case 'subaccount_local_sms':
      return 'Subaccount Local Text Messages'
    case 'local_sms':
      return 'Local Text Messages'
    case 'subaccount_tollfree_sms':
      return 'Subaccount Toll-free Text Messages'
    case 'tollfree_sms':
      return 'Toll-free Text Messages'
    case 'subaccount_rvm':
      return 'Subaccount Ringless Voicemail'
    case 'rvm':
      return 'Ringless Voicemail'
    case 'amd':
      return 'Automatic Machine Detection'
    case 'email':
      return 'Email'
    case 'lrn_lookup':
      return 'LRN Lookup'
    case 'subaccount_lrn_lookup':
      return 'Subaccount LRN Lookup'
    case 'intl_call':
      return 'International Minutes'
    case 'subaccount_intl_call':
      return 'Subaccount International Minutes'
    case 'intl_sms':
      return 'International Text Messages'
    case 'subaccount_intl_sms':
      return 'Subaccount International Text Messages'
    case 'promo_credit':
      return 'Promo Credits'
    case 'credit':
      return 'Credits'
    default:
      return ''
  }
}

const fixUnit = (type) => {
  switch (type) {
    case 'local_min':
      return 'minute(s)'
    case 'tollfree_min':
      return 'minute(s)'
    case 'intl_call':
      return 'minute(s)'
    default:
      return ''
  }
}
const fixCreditInfo = (credit) => {
  if (credit !== undefined) {
    if (credit === 0) {
      return credit + ' (debited from plan)'
    } else {
      return credit
    }
  } else {
    return '-'
  }
}

const fixRounding = (amount) => {
  if (amount !== undefined) {
    return parseFloat(amount).toFixed(3)
  } else {
    return '-'
  }
}

const toCurrency = (amount) => {
  if ((!!amount) || amount === 0) {
    if (amount < 0) {
      return '-$' + Math.abs(amount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    return '$' + amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  } else {
    return '-'
  }
}
const removeSign = (amount) => {
  if (amount !== undefined) {
    return Math.abs(amount)
  } else {
    return '-'
  }
}

export default ({ Vue }) => {
  const filters = {
    fixResourceName, fixUnit, fixCreditInfo, fixRounding, toCurrency, removeSign
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
