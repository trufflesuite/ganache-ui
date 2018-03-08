/**
 * Used to track actions dispatched server side so they can be restored via websockets when
 * a frontend client connects.
 */
import LinkedList from 'linked-list'

class Action extends LinkedList.Item {
  constructor(type, payload) {
    super()
    this.type = type
    this.payload = payload
  }
}

export default class ActionHistory extends LinkedList {
  actionTypeTracker = {}

  constructor(defaultMaxPerType, maxByType) {
    super()
    this.defaultMaxPerType = defaultMaxPerType
    this.maxByType = maxByType
  }

  forEach(cb) {
    let current = this.head
    let i = 0
    while (current !== null) {
      cb(current, i)
      i += 1
      current = current.next
    }
  }

  getMaxForType = (type) => (typeof this.maxByType[type] !== 'undefined' ? this.maxByType[type] : this.defaultMaxPerType)

  add(type, payload) {
    let action = type
    if (!(action instanceof Action)) {
      action = new Action(type, payload)
    }
    type = action.type
    payload = action.payload
    this.append(action)

    let tracker = this.actionTypeTracker[type]
    if (!tracker || tracker.head === null) {
      tracker = { head: action, tail: null, count: 0 }
    }
    if (tracker.tail) {
      tracker.tail.nextOfType = action
    }
    tracker.count += 1
    tracker.tail = action
    // Restrict maximum number of actions of the same type
    if (tracker.count > this.getMaxForType(type)) {
      const newHead = tracker.head.nextOfType
      tracker.head.detach()
      tracker.head = newHead
      tracker.count -= 1
    }
  }
}
