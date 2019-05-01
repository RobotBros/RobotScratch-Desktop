export const UBTCommandRotate = 0x1
export const UBTCommandLED = 0x4
export const UBTCommandReadDegree = 0x2
export const UBTCommandSetID = 0xCD
export const UBTCommandCalibrate = 0xD2
export const UBTCommandReadCalibrate = 0xD4

export const buildUBTCommand = (cmd, servoId, param1h, param1l, param2h, param2l) => {
  let frame = []
  // 1. HEADER
  frame.push(0xFA)
  frame.push(0xAF)

  // 2. ID
  frame.push(servoId)

  // 3. CMD
  frame.push(cmd)

  // 4. Param 1
  frame.push(param1h)
  frame.push(param1l)

  // 5. Param 2
  frame.push(param2h)
  frame.push(param2l)

  let chk = (servoId + cmd + param1l + param1h + param2h + param2l) & 0xFF
  frame.push(chk)

  // 6. Tail
  frame.push(0xED)

  return frame
}

export const ubtSetServoDegree = (servoId, degree, duration) => {
  return buildUBTCommand(UBTCommandRotate, servoId, degree, duration, 0, 0)
}

export const ubtReadServoDegree = (servoId) => {
  return buildUBTCommand(UBTCommandReadDegree, servoId, 0, 0, 0, 0)
}

export const ubtLEDOn = (servoId) => {
  return buildUBTCommand(UBTCommandLED, servoId, 1, 0, 0, 0)
}

export const ubtLEDOff = (servoId) => {
  return buildUBTCommand(UBTCommandLED, servoId, 0, 0, 0, 0)
}
