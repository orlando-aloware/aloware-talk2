import { ALL_COLUMNS } from 'src/constants/contacts-columns'
export const RELATIONS = ALL_COLUMNS
  .filter(column => column.relationName)
  .map(column => column.relationName)
