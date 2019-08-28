# Robotscratch

> Desktop version of RobotScratch

![](https://github.com/RobotBros/RobotScratch-Desktop/blob/master/screenshot/robotscratch-screentshot-1.png)
![](https://github.com/RobotBros/RobotScratch-Desktop/blob/master/screenshot/robotscratch-screentshot-2.png)
![](https://github.com/RobotBros/RobotScratch-Desktop/blob/master/screenshot/robotscratch-screentshot-3.png)

### 1. 源码编译

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:9080
yarn dev

# build electron application for production
yarn build
```

---

### 2. 帧格式


| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(N *bytes) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | CMD | DATA | CHECKSUM | 0xFE |

* 校验计算：CHECKSUM = 协议版本 XOR 指令 XOR 数据
* 除了帧头，其他地方不允许出现`0xFF`, `0xFE`, `0xFD`，否则需要转码:
  - 0xFF => 0xFD 0x0F
  - 0xFE => 0xFD 0x0E
  - 0xFD => 0xFD 0x0D
  
  转码和解码顺序：    
  接收：接收到数据 -> 解码 -> 程序处理    
  发送：程序处理生成要发送的数据 -> 转码 -> 发送数据
* 每个指令都有一个答复，通知对方是否操作成功或着具体的数据

例子：

假如需要发送数据`0xFF`, `0xFD`，命令：`0x01`, 那么计算校验和为: `0x02`

校验和 = `(0x01 ^ 0x01 ^ 0xFF ^ 0xFD) & 0xFF = 0x02`    
因为数据中间出现保留字节`0xFF`, `0xFD`，所以需要分别转码：`0xFD 0x0F`，`0xFD 0x0D`。

最后要发送的完整数据为

```
FF 01 01 FD 0F FD 0D 02 FE
```

# 

### 3. 指令列表

| 指令 | 说明 | DATA数据说明 |
|---|---|---|
| 01 | 设置不定长数据的长度 | DATA为不定长数据的长度（单位字节），如果长度超过一个字节，则按大端存储，最大不超过4个字节。 当发送完此数据后，下位机自动进入DMA模式 | 
| 02 | DMA传输不定长数据 | DATA 要传输的数据
| 03 | UBT舵机控制透传 | DATA是UBT的舵机控制协议 |
| 04 | 查询舵机角度 | DATA要查询的舵机ID，1字节（⚠️注意查询舵机会导致其失电） |
| 05 | 查询电流电压 | DATA填0，1字节 |
| 06 | 控制头灯亮度 | DATA为亮度值（0-100），1字节 |
| 07 | 查询陀螺仪三轴数据 | DATA填0，1字节 |
| 08 | 控制舵机动作和运动时间 | IDDATA填1-16，角度DATA填0-180，时间DATA填1-250，MAX 40*3=120字节  40个舵机数据（ID+角度+时间）|

# 

### 4. 状态

运行状态四个状态: 初始化，正常，调试，故障
故障代码一个字节, 电流, 电压，共四个模拟量

正常状态就系度预读默认flash固定动作

调试为上位机透传

# 

### 5. 指令详细说明

STM32 -> 上位机
数据长度统一14字节，没用到字节发0，最后一字节为0xFE，倒数一字节为校验和。

#### ✅ 指令（01）- 设置不定长数据的长度

_上位机 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(4 *bytes) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x01 | DMA数据的长度 | CHECKSUM | 0xFE |

_STM32 -> 上位机_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x01 | 0xAA = OK, 0x55 = NOK | CHECKSUM | 0xFE |
 
# 

#### ✅ 指令（02）- DMA传输不定长数据

_ESP32 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(n *bytes) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x02 | 需要传输的DMA数据 | CHECKSUM | 0xFE |

_STM32 -> ESP32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x02 | 0xAA = OK, 0x55 = NOK | CHECKSUM | 0xFE |

# 

#### ✅ 指令（03）- UBT舵机控制透传

_上位机 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(n *bytes) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x03 | 透传数据 | CHECKSUM | 0xFE |

_STM32 -> 上位机_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x03 | 0xAA = OK, 0x55 = NOK | CHECKSUM | 0xFE |

# 

#### ✅ 指令（04）- 查询舵机角度

_上位机 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x04 | 舵机ID | CHECKSUM | 0xFE |

读取舵机ID对应字节写入舵机编号，例如ID1，即0x01。

STM32 -> 上位机

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | ID(1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x04 | 0xAA = OK, 0x55 = NOK | ID | 角度 | CHECKSUM | 0xFE |

反馈舵机角度数据，ID为舵机编号，角度为对应角度数据。

# 

#### ✅ 指令（05）- 查询电流电压

_上位机 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x05 | 0x00 | CHECKSUM | 0xFE |

_STM32 -> 上位机_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 数据(1B) | 数据(1B) | 数据(1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x05 | 0xAA = OK, 0x55 = NOK | 电流高字节 | 电流低字节 | 电压高字节 | 电压低字节 | CHECKSUM | 0xFE |

# 

#### ✅ 指令（06）- 控制头灯亮度

_上位机 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x06 | 亮度 0 ～ 100 | CHECKSUM | 0xFE |

_STM32 -> 上位机_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x06 | 0xAA = OK, 0x55 = NOK | CHECKSUM | 0xFE |

# 

#### ✅ 指令（07）- 查询陀螺仪三轴数据

预留

# 

#### ✅ 指令（08）- 主机主动读取数据

_上位机 -> STM32_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 数据(1B) | 数据(1B) | 数据(nB) | 数据(1B) |校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x08 | ID | 角度 | 时间 | 电机数据n | 电机动作个数 | CHECKSUM | 0xFE |

_STM32 -> 上位机_

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(1B) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | 0x08 | 0xAA = OK, 0x55 = NOK | CHECKSUM | 0xFE |

ID+角度+运行时间 各1字节，一帧最大电机数据为40组，帧头+协议+指令+40*3字节+电机动作个数+校验+帧尾 一帧最大126字节

ID数据范围1~16

角度数据范围0~180度

运行时间数据范围1-~250ms

电机动作个数数据范围1~40

# 

