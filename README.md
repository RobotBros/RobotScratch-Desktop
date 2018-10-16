# Robotscratch

> Desktop version of RobotScratch

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

---

### 帧格式


| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 数据(N *bytes) | 校验 (1B) | 帧尾 (1B)
|--|--|--|--|--|--|
| 0xFF | 0x01 | CMD | DATA | CHECKSUM | 0xFE |

* LEN 指整个数据帧的长度
* 除了帧头，其他地方不允许出现`0xFF`, `0xFE`, `0xFD`，否则需要转码:
  - 0xFF => 0xFD 0x0F
  - 0xFE => 0xFD 0x0E
  - 0xFD => 0xFD 0x0D
  
  转码和解码顺序：    
  接收：接收到数据 -> 解码 -> 程序处理    
  发送：程序处理生成要发送的数据 -> 转码 -> 发送数据
* 每个指令都有一个答复，通知对方是否操作成功或着具体的数据
# 

### 指令列表

| 指令 | 说明 | DATA数据说明 |
|---|---|---|
| 01 | 设置不定长数据的长度 | DATA为不定长数据的长度（单位字节），如果长度超过一个字节，则按大端存储，最大不超过4个字节。 当发送完此数据后，下位机自动进入DMA模式 | 
| 02 | DMA传输不定长数据 | DATA 要传输的数据
| 03 | UBT舵机控制透传 | DATA是UBT的舵机控制协议 |

### 

运行状态四个状态: 初始化，正常，调试，故障
故障代码一个字节, 电流, 电压，共四个模拟量

正常状态就系度预读默认flash固定动作

调试为上位机透传
