import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'

const translateTagCategories = (category) => {
  switch (category) {
    case TagCategories.CAT_COMMUNICATIONS:
      return 'Communication'
    case TagCategories.CAT_CONTACTS:
      return 'Contact'
  }
  return '-'
}

export default ({ Vue }) => {
  const filters = {
    translateTagCategories
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
