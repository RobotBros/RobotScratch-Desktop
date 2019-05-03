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
  let check = calcCheck(buf, 0, buf.length - 1)
  buf.set([check], buf.length - 2)
  // tail
  buf.set([0xFE], buf.length - 1)
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
