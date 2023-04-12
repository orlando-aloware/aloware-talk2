import { ALL_COLUMNS } from 'src/constants/contacts-columns'

const columnRelations = ALL_COLUMNS
  .filter(column => column.relationName)
  .map(column => column.relationName)
const otherRelations = [
  'user',
  'workflow',
  'sequence',
  'lastCommunication'
]

export const RELATIONS = [...new Set(columnRelations.concat(otherRelations))]
