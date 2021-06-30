import communication from './communication.filters'
import contact from './contact.filters'
import tag from './tag.filters'
import credit from './credit.filters'
import datetime from './datetime.filters'
import general from './general.filters'

export default async (args) => {
  communication(args)
  contact(args)
  tag(args)
  credit(args)
  datetime(args)
  general(args)
}
