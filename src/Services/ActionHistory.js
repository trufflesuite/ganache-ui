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

  _forEach(first, getNext, cb) {
    let current = first
    let i = 0
    while (current !== null) {
      cb(current, i)
      i += 1
      current = getNext(current)
    }
  }

  /** Iterates over all actions */
  forEach(cb) {
    this._forEach(this.head, (a) => a.next, cb)
  }

  /** Iterates over all actions of a particular type */
  forEachType(type, cb) {
    const tracker = this.actionTypeTracker[type]
    if (tracker) {
      this._forEach(tracker.head, (a) => a.nextOfType, cb)
    }
  }

  getMaxForType = (type) => (typeof this.maxByType[type] !== 'undefined' ? this.maxByType[type] : this.defaultMaxPerType)

  /** Adds an action to history.
    * If the total number of actions with that type exceeds maxByType the oldest action with that type will be evicted.
    */
  add(type, payload) {
    let action = type
    if (!(action instanceof Action)) {
      action = new Action(type, payload)
    }
    type = action.type
    payload = action.payload
    this.append(action)

    // Also track order of actions by type
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
    const max = this.getMaxForType(type)
    if (max && tracker.count > max) {
      const newHead = tracker.head.nextOfType
      tracker.head.detach()
      tracker.head = newHead
      tracker.count -= 1
    }
  }

  /** Clears all actions of a particular type from history */
  clear(type) {
    this.forEachType(type, (action) => action.detach())
    this.actionTypeTracker[type] = { head: null, tail: null, count: 0 }
  }
}
