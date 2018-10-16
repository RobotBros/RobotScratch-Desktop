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


| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 长度(2B) | 数据(N *bytes) | 校验 (1B) |
|--|--|--|--|--|--|
| 0xFF | 0x01 | CMD | LEN_H LEN_L | DATA | CHECKSUM |

* LEN 指整个数据帧的长度
* 除了帧头，其他地方不允许出现`0xFF`，否则需要转码:
  - 0xFF => 0xFD 0x0F
  - 0xFE => 0xFD 0x0E
  - 0xFD => 0xFD 0x0D
  
  转码和解码顺序：
  接收：接收到数据 -> 解码 -> 程序处理
  发送：程序处理生成要发送的数据 -> 转码 -> 发送数据
* 每个指令都有一个答复，通知对方是否操作成功，答复分为`简单指令的答复`和`带数据负载的答复`, `简单命令答复`格式如下：

| 帧头(1B) | 协议版本 (1B) | 指令 (1B) | 长度(2B) | 数据(N *bytes) | 校验 (1B) |
|--|--|--|--|--|--|
| 0xFF | 0x01 | CMD | LEN_H LEN_L | DATA[0] = 1, 表示OK；DATA[0] = 0，表示NOK | CHECKSUM |

# 

### 指令列表

| 指令 | 说明 | DATA数据说明 |
|---|---|---|
| 01 | 设置不定长数据的长度 | DATA为不定长数据的长度，DATA[0] = LEN_H, DATA[1] = LEN_L。 当发送完此数据后，下位机自动进入DMA模式 | 
| 02 | DMA传输不定长数据 | DATA 要传输的数据
| 03 | UBT舵机控制透传 | DATA是UBT的舵机控制协议 |
