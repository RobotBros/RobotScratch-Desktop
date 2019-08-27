/**
 * 数据帧转码
 * 0xFF->0xFD 0x0F
 * 0xFE->0xFD 0x0E
 * 0xFD->0xFD 0x0D
 * @param {Uint8Array} arr 需要转码的数组
 * @param {Number} from 开始位置
 * @param {Number} to 结束位置
 * @return {Uint8Array} 转码后的数组
 */
export const escape = function (arr, from, to) {
  let escaped = []
  for (let i = from; i < to; i++) {
    let b = arr[i]
    if (b === 0xff) {
      escaped.push(0xfd)
      escaped.push(0x0f)
    } else if (b === 0xfe) {
      escaped.push(0xfd)
      escaped.push(0x0e)
    } else if (b === 0xfd) {
      escaped.push(0xfd)
      escaped.push(0x0d)
    } else {
      escaped.push(b)
    }
  }
  return new Uint8Array(escaped)
}

/**
 * 数据帧解码
 * 0xFF->0xFD 0x0F
 * 0xFE->0xFD 0x0E
 * 0xFD->0xFD 0x0D
 * @param {Uint8Array} arr 需要转码的数组
 * @param {Number} from 开始位置
 * @param {Number} to 结束位置
 * @return {Uint8Array} 转码后的数组
 */
export const unescape = function (arr, from, to) {
  let raw = []
  let fd = false
  for (let i = from; i < to; i++) {
    let b = arr[i]
    if (b === 0xfd) {
      fd = true
    } else if (fd && b === 0x0f) {
      raw.push(0xff)
      fd = false
    } else if (fd && b === 0x0d) {
      raw.push(0xfd)
      fd = false
    } else if (fd && b === 0x0e) {
      raw.push(0xfe)
      fd = false
    } else {
      if (fd) {
        raw.push(0xfd)
      } else {
        raw.push(b)
      }
      fd = false
    }
  }

  if (fd) {
    raw.push(0xfd)
  }

  return new Uint8Array(raw)
}

export const calcCheck = (buffer, from, to) => {
  let check = 0
  for (let i = from; i < to; i++) {
    let byte = buffer[i]
    check ^= byte
  }

  check &= 0xff
  return check
}

function toBuffer (ab) {
  var buf = Buffer.alloc(ab.byteLength)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    buf[i] = view[i]
  }
  return buf
}

export const buildFrame = (cmd, payload) => {
  let buf = new Uint8Array(payload.length + 5)
  // header
  buf.set([0xFF], 0)
  // version
  buf.set([0x01], 1)
  // command
  buf.set([cmd], 2)
  // payload
  buf.set(payload, 3)
  // checksum
  let check = calcCheck(buf, 1, buf.length - 1)
  buf.set([check], buf.length - 2)
  // tail
  buf.set([0xFE], buf.length - 1)
  buf = escape(buf, 1, buf.length - 2)
  return toBuffer(buf.buffer)
}

export const toHexString = (arr) => {
  return Array.prototype.map.call(
    arr,
    (v, i, arr) => ('00' + v.toString(16)).slice(-2)
  ).join(' ')
}

// 设置不定长数据的长度
export const FrameCmdSetLen = 0x1
// DMA传输不定长数据
export const FrameCmdSetDMA = 0x2
// UBT舵机控制透传
export const FrameCmdUBT = 0x3
// 查询舵机角度
export const FrameCmdQueryServo = 0x4
// 查询电流电压
export const FrameCmdQueryState = 0x5
// 控制头灯亮度
export const FrameCmdSetLight = 0x6
// 查询陀螺仪三轴数据
export const FrameCmdQueryGyro = 0x7
