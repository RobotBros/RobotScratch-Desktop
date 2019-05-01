export const calcCheck = (buffer, from, to) => {
  let check = 0
  for (let i = from; i < to; i++) {
    let byte = buffer[i]
    check ^= byte
  }

  check &= 0xff
  return check
}

export const buildFrame = (frameType, payload) => {
  let buf = new Uint8Array(payload.length + 3)
  buf.set(frameType, 0)
  buf.set(payload, 1)

  let check = calcCheck(buf, 0, buf.length - 1)
  buf.set(check, buf.length - 1)
  return buf
}
