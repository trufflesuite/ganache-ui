import utils from 'ethereumjs-util'

export default {
  hex: function (val) {
    if (typeof val === 'string') {
      if (val.indexOf('0x') === 0) {
        return val
      } else {
        val = new utils.BN(val)
      }
    }

    if (typeof val === 'number') {
      val = utils.intToHex(val)
    }

    // Support Buffer, BigInteger and BN library
    // Hint: BN is used in ethereumjs
    if (typeof val === 'object') {
      val = val.toString('hex')

      if (val === '') {
        val = '0'
      }
    }

    return utils.addHexPrefix(val)
  },

  number: function (val) {
    return utils.bufferToInt(utils.toBuffer(val))
  }
}
