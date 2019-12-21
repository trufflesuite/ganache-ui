const NEW_LINE = 0x0a;
const EMPTY_BUFFER = Buffer.allocUnsafe(0);

module.exports = class StreamingMessageHandler {
  static types = {
    STDERR: "stderr",
    STDOUT: "stdout"
  }

  _cache = EMPTY_BUFFER

  _conditions = {
    [StreamingMessageHandler.types.STDERR]: [],
    [StreamingMessageHandler.types.STDOUT]: [],
  }

  _handlers = {
    [StreamingMessageHandler.types.STDERR]: [],
    [StreamingMessageHandler.types.STDOUT]: [],
  }

  addErrHandler(matcher, handler) {
    this.addHandler(StreamingMessageHandler.types.STDERR, matcher, handler);
  }

  addOutHandler(matcher, handler) {
    this.addHandler(StreamingMessageHandler.types.STDOUT, matcher, handler);
  }

  addHandler(type, matcher, handler) {
    const buf = Buffer.from(matcher);
    this._conditions[type].push(buf);
    this._handlers[type].push(handler);
  }

  async _dataListener(type, data) {
    // if we don't have data we don't really care
    if (data.length === 0) return;

    // data can come in in small chunks less than a line long
    // or in bug chunks spanning several lines.
    // Our handler conditions aren't allowed to span multiple lines,
    // so we can throw out complete lines after we check them against
    // the our handler conditions.

    // the last line from previous data:
    let cache = this._cache; // -> `CAPSULE EXCEPTION: Cap`
    let searchPosition = 0;

    let newLineIndex = data.indexOf(NEW_LINE, searchPosition);
    const conditions = this._conditions[type];
    const handlers = this._handlers[type];
    while (newLineIndex !== -1) {
      // since we found a newline char we need to concatinate it with the previous data
      const newLine = Buffer.allocUnsafe(cache.length + searchPosition + newLineIndex);
      // copy the cache into this new line
      cache.copy(newLine);
      // then append the new data onto it
      data.copy(newLine, cache.length, searchPosition, newLineIndex);

      // new we can search the entire line for our handler conditions
      for (let i = 0, l = conditions.length; i < l; i++) {
        const condition = conditions[i];
        if (newLine.includes(condition)) {
          // if the handler returns true it means we shouldn't check the remaining handlers
          await handlers[i](newLine);
          if (!this._bound) return;
        }
      }

      // we've consumed the cache, so empty it
      cache = EMPTY_BUFFER;

      // then set up to search the rest of the new `data`
      searchPosition = newLineIndex + 1;

      // and then see if we have anything left
      newLineIndex = data.indexOf(NEW_LINE, searchPosition);
    }

    // we're done with this data, but it might still contain a truncated line.
    // copy anything left over into a the _cache for next time
    const newCacheLength = data.length - searchPosition;
    if (newCacheLength > 0){
      this._cache = Buffer.allocUnsafe(data.length - searchPosition);
      data.copy(this._cache, 0, searchPosition);
    } else {
      this._cache = EMPTY_BUFFER;
    }
  }

  bind(process) {
    if (this._bound) throw new Error("Already bound. Unbind first");

    this._bound = true;

    const conditions = this._conditions;
    const bound = new Map();
    const err = StreamingMessageHandler.types.STDERR;
    if (conditions[err].length !== 0) {
      const listener = this._dataListener.bind(this, err);
      process[err].on("data", listener);
      bound.set(err, listener);
    }
    const out = StreamingMessageHandler.types.STDOUT;
    if (conditions[out].length !== 0) {
      const listener = this._dataListener.bind(this, out);
      process[out].on("data", listener);
      bound.set(out, listener);
    }
    this.unbind = () => {
      bound.forEach((fn, std_) => {
        process[std_].off("data", fn);
      });
      this._bound = false;
    };
  }
  unbind() { }
}