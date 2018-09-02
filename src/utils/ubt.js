export const UBTCommandRotate = 0x1
export const UBTCommandLED = 0x4
export const UBTCommandReadDegree = 0x2
export const UBTCommandSetID = 0xCD
export const UBTCommandCalibrate = 0xD2
export const UBTCommandReadCalibrate = 0xD4

export const buildUBTCommand = (cmd, servo_id, param1_h, param1_l, param2_h, param2_l) => {
  let frame = []
  // 1. HEADER
  frame.push(0xFA)
  frame.push(0xAF)
  
  // 2. ID
  frame.push(servo_id)

  // 3. CMD
  frame.push(cmd)

  // 4. Param 1
  frame.push(param1_h)
  frame.push(param1_l)

  // 5. Param 2
  frame.push(param2_h)
  frame.push(param2_l)

  let chk = (servo_id + cmd + param1_l + param1_h + param2_h + param2_l) & 0xFF
  frame.push(chk)

  // 6. Tail
  frame.push(0xED)

  return frame
}

export const ubtSetServoDegree = (servo_id, degree, duration) => {
  return buildUBTCommand(UBTCommandRotate, servo_id, degree, duration, 0, 0)
}

export const ubtReadServoDegree = (servo_id) => {
  return buildUBTCommand(UBTCommandReadDegree, servo_id, 0, 0, 0, 0)
}

export const ubtLEDOn = (servo_id) => {
  return buildUBTCommand(UBTCommandLED, servo_id, 1, 0, 0, 0)
}

export const ubtLEDOff = (servo_id) => {
  return buildUBTCommand(UBTCommandLED, servo_id, 0, 0, 0, 0)
}
