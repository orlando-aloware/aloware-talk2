import { isLiveCall } from 'src/plugins/helpers/functions'

/**
 * Handle sequenced-duplicated items for the unthreaded view
 *
 * @param {array} items
 * @returns array
 */
export function handleDuplicatedItems (items) {
  // first unset all props previous set
  items.forEach((item, index) => {
    delete items[index].repeats
    delete items[index].hidden
  })

  const hidden = []

  items.forEach((item, index) => {
    const repeateds = findRepeateds(items, index)

    // try to find repeated comms for this contact
    if (repeateds.length > 0) {
      const repeatedItems = [item, ...repeateds.map(id => items.find(i => i.id === id))]

      let unreadRepeats = 0
      let liveCallItem

      for (const repeatedItem of repeatedItems) {
        if (!liveCallItem && isLiveCall(repeatedItem)) {
          liveCallItem = repeatedItem
        }

        if (!repeatedItem.is_read) {
          unreadRepeats++
        }
      }

      if (liveCallItem) {
        repeatedItems.forEach(repeatedItem => {
          const itemIndex = items.findIndex(i => i.id === repeatedItem.id)
          if (repeatedItem.id !== liveCallItem.id) {
            hidden.push(repeatedItem.id)
          } else {
            items[itemIndex].repeats = repeatedItems.length - 1
          }
        })
      } else {
        items[index].repeats = repeateds.length
        hidden.push(...repeateds)
      }

      items[index].unread_repeats = unreadRepeats
    }

    // mark repeated comms to dont appear
    if (hidden.includes(item.id)) {
      items[index].hidden = true
    }
  })

  return items
}

/**
 * Find repeated comms of a contact based on specific rules
 *
 * @param {array} items
 * @param {number} startIndex
 * @returns array
 */
export function findRepeateds (items, startIndex) {
  const repeateds = []
  const currentItem = items[startIndex]
  const currentType = currentItem.type
  const currentDirection = currentItem.direction
  const currentTimestamp = new Date(currentItem.created_at).getTime()

  // Time threshold in milliseconds (60 minutes = 3,600,000 ms)
  const TIME_THRESHOLD = 60 * 60 * 1000

  for (let i = startIndex + 1; i < items.length; i++) {
    const nextItem = items[i]

    // Check if it's the same contact
    if (nextItem.contact_id !== currentItem.contact_id) {
      break
    }

    // Check if type matches
    if (nextItem.type !== currentType) {
      continue
    }

    // Check if direction matches
    if (nextItem.direction !== currentDirection) {
      continue
    }

    // Check if it's within the time threshold (60 minutes)
    const nextTimestamp = new Date(nextItem.created_at).getTime()
    const timeDiff = Math.abs(currentTimestamp - nextTimestamp)

    if (timeDiff <= TIME_THRESHOLD) {
      repeateds.push(nextItem.id)
    }
  }

  return repeateds
}
