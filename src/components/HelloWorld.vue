<template>
  <div class="container" style="display: flex">
    <div class="page-lift">
      <div>
        <n-form label-placement="left" size="small" label-width="60px">
          <n-form-item label="串口">
            <n-select v-model:value="settings.serialPort" :options="settings.derives" placeholder="选择串口"
                      :consistent-menu-width="false" @click="getSerialPort()"
                      clearable :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <n-form-item label="波特率">
            <n-select v-model:value="settings.baudRate" :options="settings.BaudRateOptions"
                      placeholder="选择波特率" clearable :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <n-form-item label="校验位">
            <n-select v-model:value="settings.parity" :options="settings.parityOptions"
                      placeholder="选择校验位" clearable :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <n-form-item label="停止位">
            <n-select v-model:value="settings.stopBits" :options="settings.stopBitsOptions" placeholder="选择停止位"
                      clearable :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <n-form-item label="数据位">
            <n-select v-model:value="settings.dataBits" :options="settings.dataBitsOptions" placeholder="选择数据位"
                      clearable :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <div style="width: 100%;text-align: center">
            <n-button style="width: 80%" ghost :type="settings.serialPortOpened?'error':'primary'"
                      :disabled="!openSerialPortAllow" @click="openSerialPort">
              {{ settings.serialPortOpened ? '关闭' : '打开' }}
            </n-button>
          </div>
        </n-form>
      </div>
      <div>
        <n-upload
            action="https://naive-upload.free.beeceptor.com/"
            multiple
            directory-dnd
            :max="1"
            :default-upload="false"
            ref="uploadRef"
            v-model:file-list="fileListRef"
            :custom-request="customRequest"
            @before-upload="beforeUpdate"
            @change="handleUploadChange"
            @remove="handleUploadRemove"
        >
          <n-upload-dragger>
            <div style="margin-bottom: 12px;padding: 10px;">
              <n-icon size="48" :depth="3">
                <Icon>
                  <UploadOutlined/>
                </Icon>
              </n-icon>
            </div>
            <n-text style="font-size: 14px">
              点击或者拖动文件到该区域来上传
            </n-text>
          </n-upload-dragger>
        </n-upload>
        <div style="width: 100%;text-align: center"
             v-if="['uploading','finished'].includes((fileListRef[0]||{}).status)">
          <n-gradient-text type="info" size="12">
            {{ (fileListRef[0] || {}).numOfUploaded }}
          </n-gradient-text>
          /
          <n-gradient-text type="success" size="12">
            {{ (fileListRef[0] || {}).data.byteLength }}
          </n-gradient-text>
        </div>
        <div style="width: 100%;text-align: center;margin-top: 10px">
          <n-button
              text
              tag="a"
              target="_blank"
              type="primary"
              @click="helpUse=true"
          >
            使用说明
          </n-button>
        </div>
        <n-button type="primary" style="margin-top: 20px;width: 100%" ghost
                  v-show="(fileListRef[0]||{}).status==='pending'"
                  :disabled="!settings.serialPortOpened||!fileListRef.length"
                  @click="callUpload">
          开始上传
        </n-button>
      </div>
    </div>
    <div class="page-right">
      <div class="page-right-top">
        <div class="tool-bar">
          <n-space>
            <n-space item-style="display: flex;">
              <n-checkbox label="行号" v-model:checked="settings.showNumOfRow"/>
              <n-checkbox label="时间" v-model:checked="settings.showTime"/>
              <n-checkbox label="自动滚屏" v-model:checked="settings.autoScroll"/>
            </n-space>
          </n-space>
          <n-radio-group v-model:value="settings.receiveCoding" size="small">
            <n-radio-button :label="coding.label" :value="coding.value" :key="coding.value"
                            v-for="coding in settings.codingOptions"></n-radio-button>
          </n-radio-group>
          <n-space>
            <div style="width: 200px;display: flex;align-items: center;margin-right: 40px">
              <div style="width: 50px;color: var(--n-text-form-color)">字体</div>
              <n-slider v-model:value="settings.fontSize" :step="1" :min="10" :max="40"
                        @update:value="updateNumOfRow()"></n-slider>
            </div>
            <n-button type="error" dashed size="small" @click="communications.receive=[];settings.numOfRow=0">清空
            </n-button>
          </n-space>
        </div>
        <n-scrollbar style="display: flex;" ref="receiveScroll">
          <div style="display: flex;">

            <div v-show="settings.showNumOfRow"
                 style="padding: 6px 6px;box-sizing: border-box;background-color: var(--vt-c-bg-card);position: absolute;top: 0;left: 0;height: 100%;border-radius: 8px;opacity: 0.6">
              <div style="opacity: 0" :style="{'font-size':`${settings.fontSize}px`}">{{ settings.numOfRow }}</div>
            </div>

            <div v-show="settings.showNumOfRow"
                 style="padding: 6px 6px;">
              <div v-for="item in settings.numOfRow" :key="item" style="text-align: right"
                   :style="{'line-height':`${settings.fontSize+(22-14)}px`,'font-size':`${settings.fontSize}px`}">
                {{ item }}
              </div>
            </div>

            <div style="padding: 6px 15px 6px 10px;">
              <div style="position: fixed;left: 0;right: 0;top: 0;bottom: 0;background-color: rgba(0, 0, 0, .4);"
                   class="n-modal-mask" v-if="communications.showData.show" @click="clickHex(false)"></div>
              <n-popover :show="communications.showData.show" :x="communications.showData.x"
                         :y="communications.showData.y" trigger="manual">
                <div style="text-align: center;font-family:  monospace;letter-spacing: 2px;">
                  <n-list hoverable clickable>
                    <n-list-item @click="copy(communications.showData.content.hex)">
                      <div class="hex-show">
                        <div>十六进制：</div>
                        <div>{{ communications.showData.content.hex }}</div>
                      </div>
                    </n-list-item>
                    <n-list-item @click="copy(communications.showData.content.binary)">
                      <div class="hex-show">
                        <div>二进制：</div>
                        <div>{{ communications.showData.content.binary }}</div>
                      </div>
                    </n-list-item>
                    <n-list-item @click="copy(communications.showData.content.octonary)">
                      <div class="hex-show">
                        <div>八进制：</div>
                        <div>{{ communications.showData.content.octonary }}</div>
                      </div>
                    </n-list-item>
                    <n-list-item @click="copy(communications.showData.content.decimal)">
                      <div class="hex-show">
                        <div>十进制：</div>
                        <div>{{ communications.showData.content.decimal }}</div>
                      </div>
                    </n-list-item>

                  </n-list>
                </div>
              </n-popover>
              <div class="receive-data" @click="clickHex"
                   :style="{'word-break': settings.receiveCoding!=='HEX'?'break-all':'','line-height':`${settings.fontSize+(22-14)}px`,'font-size':`${settings.fontSize}px`}"
                   v-html="displayReceiveData">
              </div>
            </div>

          </div>
        </n-scrollbar>
        <div style="position: relative">
          <div
              style="display: flex;justify-content: space-between;position: absolute;left: 0;right: 0  ;bottom: -36px;">
            <b>RX : {{ computingRX }} Bytes</b>
            <b>TX : {{ computingTX }} Bytes</b>
          </div>
        </div>
      </div>
      <div class="page-right-bottom">
        <div class="send-content">
          <n-input type="textarea" placeholder="Some thing.."
                   :autosize="{minRows: 7,maxRows:7}"
                   :status="communications.send.status" clearable show-count
                   round :allow-input="v=>(v[v.length-1||0]!=='\n'||pressedKey.backspace)"
                   v-model:value="communications.send.text" @keyup="sendKeyup"
                   @keydown="sendKeydown"/>
        </div>
        <div class="send-tool">
          <div style="display: flex;align-items: center;gap: 10px">
            <div style="display: flex;gap: 6px">
              <div>循环发送</div>
              <n-switch v-model:value="settings.intervalSend.enable"
                        @update:value="()=>{
                          if(settings.intervalSend.enable) settings.intervalSend.time = settings.intervalSend.lastTime;
                          else {settings.intervalSend.lastTime=settings.intervalSend.time;settings.intervalSend.time = null;}
                        }"></n-switch>
            </div>
            <n-input-number :placeholder="settings.intervalSend.lastTime+''" size="small" style="width: 100px"
                            :show-button="false"
                            v-model:value="settings.intervalSend.time"
                            @update:value="settings.intervalSend.lastTime=settings.intervalSend.time"
                            @blur="()=>{if(!settings.intervalSend.enable) settings.intervalSend.time=null}">
              <template #suffix>ms</template>
            </n-input-number>
          </div>
          <n-space>
            <n-radio-group v-model:value="settings.sendCoding" size="small">
              <n-radio-button :label="coding.label" :value="coding.value" :key="coding.value"
                              v-for="coding in settings.codingOptions"></n-radio-button>
            </n-radio-group>
          </n-space>

          <div style="display: flex;align-items: center;gap: 10px">
            <div style="display: flex;gap: 6px">
              <div>结尾</div>
              <n-switch v-model:value="settings.endAppend.enable"
                        @update:value="()=>{
                          if(settings.endAppend.enable) settings.endAppend.wrap = settings.endAppend.wrap || '\n';
                          else settings.endAppend.wrap = null;
                          if(!settings.endAppend.enable)message.warning('在使用C语言的scanf函数时，关闭结尾换行符可能会导致scanf一直阻塞！⚠️⚠️⚠️');
                        }"></n-switch>
            </div>
            <n-select :placeholder="settings.endAppendOptions[2].label" :options="settings.endAppendOptions"
                      style="width: 120px" size="small"
                      v-model:value="settings.endAppend.wrap"/>
            <n-button @click="writeData()">发送(Enter)
            </n-button>
          </div>
        </div>
      </div>
    </div>


    <n-modal v-model:show="helpUse" preset="dialog"
             title="使用说明"
             style="width: 800px;"
             negative-text="关 闭">
      <h1 style="text-align: center">串口文件传输使用说明</h1>
      <n-alert type="info">
        由于在学习LCD显示UTF8中文时，单片机 FLASH 中的字库在之前被误删了，百度了很久还是找不到一个简单方便的方法，所以自己写了一个。
      </n-alert>
      <n-alert type="warning" style="margin-top: 10px">
        如果长时间进度卡在一个地方，可能是因为数据校验失败导致进入了死循环
      </n-alert>
      <h2>
        串口文件传输之前需要在单片机的增加一些代码来配合
      </h2>
      <div style="font-size: 18px;margin: 10px 0">以下是一个示例，和您的串口/SPI/FLASH的配置/函数名可能有些不同，替换成对应功能的函数即可</div>
      <n-card title="main.c">
        <template #header-extra>
          <n-popover>
            <template #trigger>
              <n-icon size="16" style="cursor: pointer;" class="active-green" @click="copyTransferCode(transferMatchCode)">
                <copy-outline/>
              </n-icon>
            </template>
            <span>复制代码</span>
          </n-popover>
        </template>
        <n-code word-wrap :code="transferMatchCode" language="c" show-line-numbers/>
      </n-card>
    </n-modal>
  </div>

</template>

<script setup>
import {computed, nextTick, onBeforeMount, onBeforeUnmount, reactive, ref, watch} from 'vue'
import {
  NButton,
  NCheckbox,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NList,
  NListItem,
  NPopover,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NSelect,
  NSlider,
  NSpace,
  NSwitch,
  NText,
  NUpload,
  NUploadDragger,
  NGradientText,
  NModal,
  NCard,
  NCode,
  NAlert
} from 'naive-ui';
import {UploadOutlined} from '@vicons/antd';
import {CopyOutline} from '@vicons/ionicons5'
import {Icon} from '@vicons/utils'
import dayjs from 'dayjs';
import iconv from 'iconv-lite'
import {clipboard} from 'electron';
import {autoDetect} from '@serialport/bindings-cpp' //这就是Node-SerialPort与底层系统通信的方式。默认情况下，我们会自动检测Windows，Linux和OSX（大多数地方都调用OSX），并为您的系统加载适当的模块。

// eslint-disable-next-line no-unused-vars
const message = window.$message;

const Binding = autoDetect();// 返回自动返回对应平台的初始化接口:  DarwinBindingInterface | WindowsBindingInterface | LinuxBindingInterface

const settings = reactive({
  derives: [],
  BaudRateOptions: [
    300, 1200, 2400, 4800, 9600, 14400, 19200, 28800,
    38400, 57600, 74880, 115200, 230400,460800,921600
  ].map(v => ({label: v, value: v})),
  parityOptions: [
    {label: 'None(无)', value: 'Node'},
    {label: 'Odd(奇)', value: 'Odd'},
    {label: 'Even(偶)', value: 'Even'}
  ],
  stopBitsOptions: [
    {label: 1, value: 1},
    {label: 2, value: 2},
  ],
  dataBitsOptions: [
    {label: 5, value: 5},
    {label: 6, value: 6},
    {label: 7, value: 7},
    {label: 8, value: 8},
  ],
  codingOptions: [
    {label: 'ASCII', value: 'ASCII'},
    {label: 'HEX', value: 'HEX'},
    {label: 'UTF-8', value: 'UTF-8'},
    {label: 'GBK', value: 'GBK'},
  ],
  endAppendOptions: [
    {label: 'CRLF(\\r\\n)', value: '\r\n'},
    {label: 'CR(\\r)', value: '\r'},
    {label: 'LF(\\n)', value: '\n'},
    {label: 'LF2(\\n\\n)', value: '\n\n'},
  ],
  serialPort: undefined,                           // 串口
  serialPortOpened: false,                         // 串口已打开
  baudRate: 115200,                                // 波特率
  parity: 'None',                                  // 校验位
  stopBits: 1,                                     // 停止位
  dataBits: 8,                                     // 数据位
  fontSize: 14,                                    // 字体大小
  sendCoding: 'UTF-8',                             // 发送编码
  receiveCoding: 'UTF-8',                          // 接收编码
  showNumOfRow: true,                              // 显示行号
  numOfRow: 0,                                     // 行数
  showTime: true,                                  // 显示时间
  autoScroll: true,                                // 自动滚动
  intervalSend: {enable: false, time: undefined, lastTime: 500, intervalId: undefined},  // 循环发送
  endAppend: {enable: true, wrap: '\n'},     // 结尾
})


const communications = reactive({
  send: {
    text: '',
    txBytes: '',
    status: undefined,
  },
  receive: [],
  showData: {
    show: false,
    x: 0,
    y: 0,
    element: undefined,
    content: '',
  }
})

const transferMatchCode = `
#include "stm32f4xx.h"
#include "bsp_debug_usart.h"
#include "bsp_spi_flash.h"

void receiveFile();

int main(void) {
    // 初始化 串口
    DEBUG_USART_Config();
    // 初始化 SPI FLASH
    SPI_FLASH_Init();
    // 接收数据
    receiveFile();
}


/**
 * 保存文件的起始地址
 */
static uint32_t addr = 0x00000000;


void checkSave(const uint8_t *buff, uint16_t len) {
    uint8_t buffer[1024];
    SPI_FLASH_BufferRead(buffer, addr, len);
    for (int i = 0; i < len; ++i) {
        if (buffer[i] != buff[i]) {
            while(1);
        }
    }
}

/**
 * 保存缓冲区数据
 * @param buff 缓冲区数据
 * @param len 缓冲区数据长度
 */
void doSave(uint8_t *buff, uint16_t len) {
    if ((addr % 4096) == 0) {
        SPI_FLASH_SectorErase(addr);
    }
    SPI_FLASH_BufferWrite(buff, addr, len);
    checkSave(buff, len);
    addr += len;
}

/**
 * 传输完毕，并且保存成功后执行
 *
 * 可以在此验证数据是否已经正确地保存到FLASH
 */
void afterSave() {
    uint8_t buffer[1024] = {0};
    uint16_t count = addr / 1024;
    uint16_t numOfSingle = addr % 1024;
    for (uint16_t i = 0; i < count; ++i) {
        SPI_FLASH_BufferRead(buffer, i * 1024, 1024);
    }
    SPI_FLASH_BufferRead(buffer, count * 1024, numOfSingle);
    printf("%s", buffer);
}

/**
 * 接收串口文件传输
 */
void receiveFile() {
    uint8_t buff[1024] = {0};
    uint16_t len = 0;
    uint8_t data;

    // 协议建立
    uint8_t flag = 1;
    for (uint8_t i = 0; i < 10; ++i) {
        if (Usart_GetData() != 0xAA) {
            flag = 0;
        }
        Usart_SendByte(DEBUG_USART, 0xAA);
    }
    if (flag == 0) {
        return;
    }

    // 协议建立成功！开始传输...
    flag = 0;
    uint8_t tmp_buff[10] = {0};
    uint8_t end_cmd[10] = {0x11, 0x33, 0x11, 0x44, 0x55, 0x22, 0x00, 0x99, 0x99, 0x99};
    while (1) {
        data = Usart_GetData();

        /**
         * 接收到全部结束指令 ，表示已经传输完毕
         * 接收到结束指令的其中一个，暂时不存入缓冲区，直到接收到 全部结束指令 或 结束指令的其中一个
         */
        if (data == end_cmd[flag]) {
            // 存入临时缓冲区
            tmp_buff[flag] = data;
            flag++;
            if (flag == 10) {
                // 传输完毕
                doSave(buff, len);
                afterSave();
                break;
            }
        } else {
            // 如果临时缓冲区长度不为0，将临时缓冲区内容存入正常缓冲区
            if (flag != 0) {
                tmp_buff[flag] = data;
                flag++;
            } else {
                // 为了方便统一操作，所以把正常数据也存入缓冲区
                tmp_buff[0] = data;
                flag = 1;
            }

            for (uint8_t i = 0; i < flag; i++) {
                buff[len] = tmp_buff[i];
                len++;
                if (len == 1024) {
                    // buffer is filled
                    doSave(buff, len);
                    len = 0;
                }
            }
            flag = 0;
        }
        // 为确保传输不出现漏传等问题，返回任意一个响应字符，SSCOM 收到响应才会接着下一个数据
        printf("x");
    }
}
`;

const uploadRef = ref(0);
const fileListRef = ref([])
const helpUse = ref(false);

const callUpload = () => {
  uploadRef.value?.submit();
}

const customRequest = async (options) => {
  const file = fileListRef.value[0];
  const data = (fileListRef.value[0] || {}).data
  if (!data) {
    message.warning('请先选择文件再上传');
  }
  await closeSerialPort();
  await openSerialPort(false);

  const startCmd = [0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA];
  const endCmd = [0x11, 0x33, 0x11, 0x44, 0x55, 0x22, 0x00, 0x99, 0x99, 0x99];
  const buff = Buffer.alloc(32, 0, "binary");

  let timeout = setTimeout(async () => {
    message.error('建立连接超时！请查看使用说明')
    await closeSerialPort();
    await openSerialPort(true);
  }, 300);
  // 连接
  for (let i = 0; i < startCmd.length; i++) {
    await port.write(Buffer.of(startCmd[i]));
    const {buffer} = await port.read(buff, 0, 1);
    console.log(buffer);
    if (buffer[0] !== startCmd[i]) {
      message.error('建立连接失败！请查看使用说明');
      readData().then();
      return;
    }
  }
  clearTimeout(timeout);


  // 传输
  file.percentage = 0;
  file.status = 'uploading';
  console.log('文件大小：', data.byteLength);
  for (let i = 0; i < data.byteLength; i++) {
    //取消传输
    if (!fileListRef.value[0]) {
      break;
    }
    await port.write(Buffer.of(data.getUint8(i)));
    await port.read(buff, 0, 32);
    file.numOfUploaded = i + 1;
    file.percentage = Math.ceil((file.numOfUploaded / data.byteLength) * 100)
  }

  // 完成
  for (let i = 0; i < endCmd.length; i++) {
    await port.write(Buffer.of(endCmd[i]));
    await port.read(buff, 0, 32);
  }
  file.status = 'finished';

  // 继续监听
  await port.flush();
  readData().then();
}

const handleUploadChange = (data) => {
  fileListRef.value = data.fileList
}
const handleUploadRemove = ({file}) => {
  return true;
}

const beforeUpdate = (options) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async res => {
      const data = new DataView(res.target.result);
      if (data.byteLength === 0) {
        message.warning('文件内容不能为空');
        resolve(false);
        return;
      }
      resolve(true);
      options.file.data = data;
    }
    fileReader.readAsArrayBuffer(options.file.file);
  })
};


const openSerialPortAllow = computed(() => {
  const {serialPort, baudRate, parity, stopBits, dataBits} = settings;
  return serialPort && baudRate && parity && stopBits && dataBits;
})

const getSerialPort = async () => {
  settings.derives = (await Binding.list()).map(res => ({
    label: res.path.substring(res.path.lastIndexOf('/') + 1),
    value: res.path
  }));
}


let port = undefined;


/**
 * 引脚 定义 符号
 * 1 载波检测 DCD（Data Carrier Detect）
 * 2 接收数据 RXD（Received Data）
 * 3 发送数据 TXD（Transmit Data）
 * 4 数据终端准备好 DTR（Data Terminal Ready）
 * 5 信号地 SG（Signal Ground）
 * 6 数据准备好 DSR（Data Set Ready）
 * 7 请求发送 RTS（Request To Send）
 * 8 清除发送 CTS（Clear To Send）
 * 9 振铃提示 RI（Ring Indicator）
 * @returns {Promise<void>}
 */
/**
 * vmin = 0 , vtime = 0 : 读不到数据，read 立即返回。
 * vmin !=0 , vtime = 0 : 读到 vmin 个数据才返回，否则阻塞等待。
 * vmin !=0 , vtime !=0 : 读到 vmin 个数据，或者从进入 read 后读第一个数据 vtime 时间，任一满足返回，单位为s。没有数据会阻塞。
 * vmin =0  , vtime !=0 : 读不到数据，read 阻塞 vtime 时间返回
 */
const openSerialPort = async (readEnable = true) => {
  if (settings.serialPortOpened) return closeSerialPort();
  try {
    port = await Binding.open({
      path: settings.serialPort,        // 串口路径
      baudRate: settings.baudRate,      // 波特率
      dataBits: settings.dataBits,      // 数据位
      stopBits: settings.stopBits,      // 停止位
      parity: settings.parity,          // 校验位：奇偶校验
      lock: true,                       // 防止其他进程打开端口。Windows目前不支持false。默认为true
      rtscts: false,                    // 流控制设置。默认为false
      xon: false,                       // 流控制设置。默认为false
      xoff: false,                      // 流控制设置。默认为false
      xany: false,                      // 流控制设置。默认为false
      hupcl: true,                      // 关闭DTR。默认为true
      vmin: 1,                          // 默认为1。读取到一个数据返回
      vtime: 0,                         // 默认为0。否则阻塞等待
    });
  } catch (e) {
    message.error('串口打开失败！请确认串口是否已经连接～');
    return;
  }

  port.set({dtr: false});

  if (!port.isOpen) {
    port = undefined;
    settings.serialPortOpened = false;
    window.$message.error('串口打开失败！可能被其它程序占用了。。。');
    return;
  }
  settings.serialPortOpened = true;
  if (readEnable) readData().then();
}

const closeSerialPort = async () => {
  if (port && port.isOpen) await port.close();
  port = undefined;
  settings.serialPortOpened = false;
}

let readImmediateId = undefined;
const readData = async () => {
  let data;
  const buff = Buffer.alloc(32, 0, "binary");
  let index = communications.receive.length ? communications.receive.length - 1 : 0;

  // eslint-disable-next-line no-constant-condition
  const readImmediate = async () => {
    try {
      let {buffer, bytesRead} = await port.read(buff, 0, 32);
      // console.log(buffer);
      // 如果没有接收到过数据，或者上一次接收的数据是发送的，或者上一次接收的数据已经超过1s，则新建一个接收记录
      if (
          communications.receive.length === 0 ||
          communications.receive[communications.receive.length - 1].isSend ||
          communications.receive[communications.receive.length - 1].datetime <
          new Date().getTime() - 1000
      ) {
        index = communications.receive.length;
        data = Buffer.from(buffer.slice(0, bytesRead));
        communications.receive[index] = {
          datetime: new Date().getTime(),
          data: data,
          ...convertBinary(data),
        };
      } else {
        // 间隔少于1s
        data = Buffer.concat([
          communications.receive[index].data,
          buffer.slice(0, bytesRead),
        ]);
        communications.receive[index] = {
          datetime: communications.receive[index].datetime,
          data: data,
          ...convertBinary(data),
        };
      }
    } catch (e) {
      console.log("readData------->>>", e);
      clearImmediate(readImmediateId);
      readImmediateId = undefined;
      await closeSerialPort();
      return;
    }
    // 继续执行setImmediate
    if (readImmediateId) {
      readImmediateId = setImmediate(readImmediate);
    }
  }
  // 开始执行setImmediate
  readImmediateId = setImmediate(readImmediate);
};


const convertBinary = (data) => {
  return {
    'ASCII': data.toString('ASCII').replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    'HEX': data.toString('HEX').toUpperCase().replace(/(.{2})/g, '<span class="HEX" style="cursor: pointer">$1</span> '),
    'UTF-8': data.toString('UTF-8'),
    'GBK': new TextDecoder('GBK').decode(data),
  }
};

const displayReceiveData = computed(() => {
  let data = communications.receive;
  if (!data.length) return '';
  let content = '';
  if (settings.showTime) data.forEach(v => {
    if (!v?.isSend) content += `<span style="color: red">「${dayjs(v.datetime).format('YYYY-MM-DD HH:mm:ss')}」</span>${v[settings.receiveCoding]}\n`;
    else content += `<span style="color: #2a947d"><span style="color: red">「${dayjs(v.datetime).format('YYYY-MM-DD HH:mm:ss')}」</span>${v[settings.receiveCoding]}\n</span>`;
  });
  else data.forEach(v => {
    if (!v?.isSend) content += `${v[settings.receiveCoding]}\n`
    else content += `<span style="color: #2a947d">${v[settings.receiveCoding]}\n</span>`
  });
  nextTick(() => updateNumOfRow());
  return content;
})
window.onresize = () => updateNumOfRow();

const receiveScroll = ref();
const updateNumOfRow = () => nextTick(() => {
  settings.numOfRow = Math.ceil(document.querySelector('.receive-data').offsetHeight / (settings.fontSize + (22 - 14)));
  if (settings.autoScroll) {
    receiveScroll.value.scrollBy({top: document.querySelector('.receive-data').offsetHeight/*, behavior: 'smooth'*/})
  }
});

const computingRX = computed(() => {
  let total = 0;
  communications.receive.filter(v => !v.isSend).forEach(v => total += v.data.length);
  return total;
});
const computingTX = computed(() => {
  let total = 0;
  communications.receive.filter(v => v.isSend).forEach(v => total += v.data.length);
  return total;
});

const clickHex = (e) => {
  if (e === false) {
    communications.showData.show = false;
    communications.showData.element.style = 'cursor: pointer;';
    return;
  }
  switch (e.target.classList[0]) {
    case 'HEX':
      // eslint-disable-next-line no-case-declarations
      const {x, y} = {
        x: e.target.getBoundingClientRect().left,
        y: e.target.getBoundingClientRect().top
      }
      communications.showData.show = true;
      e.target.style = `background:#63e2b7;cursor: pointer;`;
      communications.showData.x = (x + e.target.offsetWidth / 2);
      communications.showData.y = y;
      // eslint-disable-next-line no-case-declarations
      let decimal = parseInt(e.target.innerText, 16);
      communications.showData.content = {
        hex: e.target.innerText,
        decimal: String(decimal),
        octonary: decimal.toString(8),
        binary: decimal.toString(2).replace(/(.{4})/g, '$1 ').trim(),
      };
      communications.showData.element = e.target;
      return;
    default:
      return;
  }
}

const pressedKey = reactive({
  shift: false,
  backspace: false,
});
const sendKeyup = (e) => {
  switch (e.keyCode) {
    case 16:
      pressedKey.shift = false;
      break;
    case 8:
      pressedKey.backspace = false;
      break;
  }
}
const sendKeydown = (e) => {
  switch (e.keyCode) {
    case 16: /* Shift */
      pressedKey.shift = true;
      break;
    case 8:
      pressedKey.backspace = true;
      break;
    case 13: /* Enter */
      if (pressedKey.shift) {
        communications.send.text = (communications.send.text || '') + '\n';
        return;
      }
      writeData();
      break;
  }
  if (communications.send.text) communications.send.status = undefined;
}


const writeData = async () => {
  if (!settings.serialPortOpened) return message.warning('串口还未开启～🫣');
  communications.send.status = communications.send.text ? undefined : 'error';
  if (!communications.send.text) return;
  let data, sendData;
  switch (settings.sendCoding) {
    case 'UTF-8':
      data = Buffer.from(communications.send.text);
      break;
    case 'GBK':
      data = Buffer.from(iconv.encode(communications.send.text, "GBK"));
      break;
    case 'HEX':
      data = Buffer.from(iconv.encode(communications.send.text, "HEX"));
      if (!data.length) return message.error('您输入的好像不是 HEX 。。。😨');
      // if (communications.send.text.split('').some(v => (v < '1' || v > '9') && (v < 'A' || v > 'F'))) {
      //   message.warning('您可能输入了 HEX 中，但不全是 HEX 。。。😥');
      // }
      break;
    case 'ASCII':
      data = Buffer.from(iconv.encode(communications.send.text, "ASCII"));
      let num = 0;
      data.forEach(v => num = num + (v === 63 ? 1 : 0));
      if (num >= 3) {
        message.warning('您输入的可能不是ASCII，如果您确认您输入的ASCII，请忽略我～😜');
      }
      break;
  }

  //结尾
  if (settings.endAppend.enable) {
    sendData = Buffer.concat([data, Buffer.from(settings.endAppend.wrap)]);
  }else {
    sendData = data;
  }
  try {
    await port.write(sendData);
    sendDataToDisplay(data);
    if (settings.intervalSend.enable) {
      settings.intervalSend.intervalId = setInterval(async () => {
        if (!settings.intervalSend.enable || !settings.serialPortOpened) {
          clearInterval(settings.intervalSend.intervalId);
          return;
        }
        await port.write(sendData);
        sendDataToDisplay(data);
      }, settings.intervalSend.time);
    } else communications.send.text = '';
  } catch (e) {
    console.log('writeData------->>>', e)
  }
}

const sendDataToDisplay = (data) => {
  communications.receive[communications.receive.length] = {
    datetime: new Date().getTime(),
    isSend: true,
    data: data,
    ...convertBinary(data)
  }
}

// eslint-disable-next-line no-unused-vars
const copy = (text) => {
  clipboard.writeText(text);
  message.success('Copy SUCCESS!');
  clickHex(false);
}


const copyTransferCode=(code)=>{
  clipboard.writeText(code);
  message.success('复制成功');
  helpUse.value = false;
}

const rememberSettings = () => {
  const {
    serialPort,       // 串口
    baudRate,         // 波特率
    parity,           // 校验位
    stopBits,         // 停止位
    dataBits,         // 数据位
    fontSize,         // 字体大小
    sendCoding,       // 发送编码
    receiveCoding,    // 接收编码
    showNumOfRow,     // 显示行号
    showTime,         // 显示时间
    autoScroll,       // 自动滚动
    intervalSend,     // 定时发送
    endAppend,        // 结尾附加
  } = settings;
  localStorage.setItem('SerialPortSettings', JSON.stringify({
    serialPort,       // 串口
    baudRate,         // 波特率
    parity,           // 校验位
    stopBits,         // 停止位
    dataBits,         // 数据位
    fontSize,         // 字体大小
    sendCoding,       // 发送编码
    receiveCoding,    // 接收编码
    showNumOfRow,     // 显示行号
    showTime,         // 显示时间
    autoScroll,       // 自动滚动
    intervalSend,     // 定时发送
    endAppend,        // 结尾附加
  }))
}

watch(settings, (newVal, oldValue) => {
  rememberSettings();
})


const recoverSettings = () => {
  let recover = JSON.parse(localStorage.getItem('SerialPortSettings') || '{}');
  Object.keys(recover).forEach(key => settings[key] = recover[key]);
}

onBeforeMount(async () => {
  recoverSettings();
  await getSerialPort();
})

onBeforeUnmount(async () => {
  await closeSerialPort();
})
</script>


<style scoped>
.page-lift {
  height: 100%;
  width: 230px;
  background-color: var(--vt-c-bg-card);
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/*滚动条样式*/
.page-lift::-webkit-scrollbar {
  width: 4px;
  display: none;
}

.page-lift::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.page-lift::-webkit-scrollbar-track {
  display: none;
}

.card-title {
  color: var(--vt-c-text-1);
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  margin-left: 14px
}

.page-right {
  height: 100%;
  width: calc(100% - 230px - 16px);
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-right > div {
  border-radius: 10px;
  background-color: var(--vt-c-bg-card);
  padding: 10px;
  box-sizing: border-box;
}

.page-right > .page-right-top {
  height: calc(100% - 240px - 30px);
  position: relative;
  padding-top: 50px;
}

.page-right > .page-right-top > .tool-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  left: 10px;
  top: 10px;
  right: 10px;
  padding-bottom: 10px;
}

.page-right > .page-right-bottom {
  height: 240px;
}


.page-right > .page-right-bottom > .send-content {
  height: calc(100% - 40px);
}

.page-right > .page-right-bottom > .send-tool {
  height: 40px;
  /*background-color: red;*/
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.n-form {
  background: var(--vt-c-bg-card);
  padding: 10px;
  border-radius: 10px;
}

.hex-show {
  width: 250px;
  display: flex;
  justify-content: center;
}

.hex-show > div {
  width: 50%;
}

.hex-show > div:nth-child(1) {
  text-align: left;
}

.hex-show > div:nth-child(2) {
  text-align: left;
}

.receive-data {
  font-family: monospace;
  white-space: pre-wrap;
}

.active-green:active{
  color: #7fe7c4;
}
</style>
