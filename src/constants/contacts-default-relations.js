import { ALL_COLUMNS } from 'src/constants/contacts-columns'
export const ALL_COLUMNS_WITH_RELATION = ALL_COLUMNS
  .filter(column => column.relationName)
  .map(column => column.name)
