import * as TagCategory from 'src/constants/tag-categories'

const translateTagCategory = (category) => {
  switch (category) {
    case TagCategory.CAT_COMMUNICATIONS:
      return 'Communication'
    case TagCategory.CAT_CONTACTS:
      return 'Contact'
  }
  return '-'
}

export default ({ Vue }) => {
  const filters = {
    translateTagCategory
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
