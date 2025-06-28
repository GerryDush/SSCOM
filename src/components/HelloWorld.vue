<template>
  <div class="container" style="display: flex">
    <div class="page-lift">
      <div>
        <n-form label-placement="left" size="small" label-width="60px">
          <n-form-item label="串口">
            <n-select v-model:value="settings.serialPort" :options="settings.derives" placeholder="选择串口"
              :consistent-menu-width="false" @click="getSerialPort()" clearable
              :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <n-form-item label="波特率">
            <n-select v-model:value="settings.baudRate" :options="settings.BaudRateOptions" placeholder="选择波特率"
              clearable :disabled="settings.serialPortOpened"></n-select>
          </n-form-item>
          <n-form-item label="校验位">
            <n-select v-model:value="settings.parity" :options="settings.parityOptions" placeholder="选择校验位" clearable
              :disabled="settings.serialPortOpened"></n-select>
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
            <n-button :loading="settings.serialPortOpenLoading" style="width: 80%" ghost :type="settings.serialPortOpened ? 'error' : 'primary'"
              :disabled="!openSerialPortAllow" @click="openSerialPort">
              {{ settings.serialPortOpened ? '关闭' : '打开' }}
            </n-button>
          </div>
        </n-form>
      </div>
      <div>
        <n-upload action="https://naive-upload.free.beeceptor.com/" multiple directory-dnd :max="1"
          :default-upload="false" ref="uploadRef" v-model:file-list="fileListRef" :custom-request="customRequest"
          @before-upload="beforeUpdate" @change="handleUploadChange" @remove="handleUploadRemove">
          <n-upload-dragger>
            <div style="margin-bottom: 12px;padding: 10px;">
              <n-icon size="48" :depth="3">
                <Icon>
                  <UploadOutlined />
                </Icon>
              </n-icon>
            </div>
            <n-text style="font-size: 14px">
              点击或者拖动文件到该区域来上传
            </n-text>
          </n-upload-dragger>
        </n-upload>
        <div style="width: 100%;text-align: center"
          v-if="['uploading', 'finished'].includes((fileListRef[0] || {}).status)">
          <n-gradient-text type="info" size="12">
            {{ (fileListRef[0] || {}).numOfUploaded }}
          </n-gradient-text>
          /
          <n-gradient-text type="success" size="12">
            {{ (fileListRef[0] || {}).data.byteLength }}
          </n-gradient-text>
        </div>
        <div style="width: 100%;text-align: center;margin-top: 10px">
          <n-button text tag="a" target="_blank" type="primary" @click="helpUse = true">
            使用说明
          </n-button>
        </div>
        <n-button type="primary" style="margin-top: 20px;width: 100%" ghost
          v-show="(fileListRef[0] || {}).status === 'pending'"
          :disabled="!settings.serialPortOpened || !fileListRef.length" @click="callUpload">
          开始上传
        </n-button>
      </div>
    </div>
    <div class="page-right">
      <div class="page-right-top">
        <div class="tool-bar">
          <n-space>
            <n-space item-style="display: flex;">
              <n-checkbox label="行号" v-model:checked="settings.showNumOfRow" />
              <n-checkbox label="时间" v-model:checked="settings.showTime" />
              <n-checkbox label="自动滚屏" v-model:checked="settings.autoScroll" />
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
            <n-button type="error" dashed size="small" @click="communications.receive = []; settings.numOfRow = 0">清空
            </n-button>
          </n-space>
        </div>
        <n-scrollbar style="display: flex;" ref="receiveScroll">
          <div class="msg-body" style="display: flex;">

            <div v-show="settings.showNumOfRow"
              style="padding: 6px 6px;box-sizing: border-box;background-color: var(--vt-c-bg-card);position: absolute;top: 0;left: 0;height: 100%;border-radius: 8px;opacity: 0.6">
              <div style="opacity: 0" :style="{ 'font-size': `${settings.fontSize}px` }">{{ settings.numOfRow }}</div>
            </div>

            <div v-show="settings.showNumOfRow" style="padding: 6px 6px;">
              <div v-for="item in settings.numOfRow" :key="item" style="text-align: right"
                :style="{ 'line-height': `${settings.fontSize + (22 - 14)}px`, 'font-size': `${settings.fontSize}px` }">
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
                :style="{ 'word-break': settings.receiveCoding !== 'HEX' ? 'break-all' : '', 'line-height': `${settings.fontSize + (22 - 14)}px`, 'font-size': `${settings.fontSize}px` }"
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
          <n-input type="textarea" placeholder="Some thing.." :autosize="{ minRows: 7, maxRows: 7 }"
            :status="communications.send.status" clearable show-count round
            :allow-input="v => (v[v.length - 1 || 0] !== '\n' || pressedKey.backspace)"
            v-model:value="communications.send.text" @keyup="sendKeyup" @keydown="sendKeydown" />
        </div>
        <div class="send-tool">
          <div style="display: flex;align-items: center;gap: 10px">
            <div style="display: flex;gap: 6px">
              <div>循环发送</div>
              <n-switch v-model:value="settings.intervalSend.enable" @update:value="() => {
                if (settings.intervalSend.enable) settings.intervalSend.time = settings.intervalSend.lastTime;
                else { settings.intervalSend.lastTime = settings.intervalSend.time; settings.intervalSend.time = null; }
              }"></n-switch>
            </div>
            <n-input-number :placeholder="settings.intervalSend.lastTime + ''" size="small" style="width: 100px"
              :show-button="false" v-model:value="settings.intervalSend.time"
              @update:value="settings.intervalSend.lastTime = settings.intervalSend.time"
              @blur="() => { if (!settings.intervalSend.enable) settings.intervalSend.time = null }">
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
              <n-switch v-model:value="settings.endAppend.enable" @update:value="() => {
                if (settings.endAppend.enable) settings.endAppend.wrap = settings.endAppend.wrap || '\n';
                else settings.endAppend.wrap = null;
                if (!settings.endAppend.enable) message.warning('在使用C语言的scanf函数时，关闭结尾换行符可能会导致scanf一直阻塞！⚠️⚠️⚠️');
              }"></n-switch>
            </div>
            <n-select :placeholder="settings.endAppendOptions[2].label" :options="settings.endAppendOptions"
              style="width: 120px" size="small" v-model:value="settings.endAppend.wrap" />
            <n-button @click="writeData()">发送(Enter)
            </n-button>
          </div>
        </div>
      </div>
    </div>


    <n-modal v-model:show="helpUse" preset="dialog" title="使用说明" style="width: 800px;" negative-text="关 闭">
      <h1 style="text-align: center">串口文件传输使用说明</h1>
      <n-alert type="info">
        需要在接收端实现XModem协议
      </n-alert>
      <div style="font-size: 18px;margin: 10px 0">以下是一个示例</div>
      <n-card title="XModem.h">
        <template #header-extra>
          <n-popover>
            <template #trigger>
              <n-icon size="16" style="cursor: pointer;" class="active-green"
                @click="copyTransferCode(transferMatchCode[0])">
                <copy-outline />
              </n-icon>
            </template>
            <span>复制代码</span>
          </n-popover>
        </template>
        <n-code word-wrap :code="transferMatchCode[0]" language="cpp" show-line-numbers />
      </n-card>
      <n-card title="XModem.cpp">
        <template #header-extra>
          <n-popover>
            <template #trigger>
              <n-icon size="16" style="cursor: pointer;" class="active-green"
                @click="copyTransferCode(transferMatchCode[1])">
                <copy-outline />
              </n-icon>
            </template>
            <span>复制代码</span>
          </n-popover>
        </template>
        <n-code word-wrap :code="transferMatchCode[1]" language="cpp" show-line-numbers />
      </n-card>
    </n-modal>
  </div>

</template>

<script setup>
import { computed, nextTick, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue'
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
import { UploadOutlined } from '@vicons/antd';
import { CopyOutline } from '@vicons/ionicons5'
import { Icon } from '@vicons/utils'
import dayjs from 'dayjs';
import { SerialPort } from "tauri-plugin-serialplugin";
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { fetch } from '@tauri-apps/plugin-http';
// import iconv from 'iconv-lite'
// import {clipboard} from 'electron';
// import {autoDetect} from '@serialport/bindings-cpp' //这就是Node-SerialPort与底层系统通信的方式。默认情况下，我们会自动检测Windows，Linux和OSX（大多数地方都调用OSX），并为您的系统加载适当的模块。

// eslint-disable-next-line no-unused-vars
const message = window.$message;

// const Binding = autoDetect();// 返回自动返回对应平台的初始化接口:  DarwinBindingInterface | WindowsBindingInterface | LinuxBindingInterface

const settings = reactive({
  derives: [],
  BaudRateOptions: [
    300, 1200, 2400, 4800, 9600, 14400, 19200, 28800,
    38400, 57600, 74880, 115200, 230400, 460800, 921600
  ].map(v => ({ label: v, value: v })),
  parityOptions: [
    { label: 'None(无)', value: 'None' },
    { label: 'Odd(奇)', value: 'Odd' },
    { label: 'Even(偶)', value: 'Even' }
  ],
  stopBitsOptions: [
    { label: 1, value: 'One' },
    { label: 2, value: 'Two' },
  ],
  dataBitsOptions: [
    { label: 5, value: 'Five' },
    { label: 6, value: 'Six' },
    { label: 7, value: 'Seven' },
    { label: 8, value: 'Eight' },
  ],
  codingOptions: [
    { label: 'ASCII', value: 'ASCII' },
    { label: 'HEX', value: 'HEX' },
    { label: 'UTF-8', value: 'UTF-8' },
    { label: 'GBK', value: 'GBK' },
  ],
  endAppendOptions: [
    { label: 'CRLF(\\r\\n)', value: '\r\n' },
    { label: 'CR(\\r)', value: '\r' },
    { label: 'LF(\\n)', value: '\n' },
    { label: 'LF2(\\n\\n)', value: '\n\n' },
  ],
  serialPort: undefined,                           // 串口
  serialPortOpened: false,                         // 串口已打开
  serialPortOpenLoading: false,                    // 串口打开加载中
  baudRate: 115200,                                // 波特率
  parity: 'None',                                  // 校验位
  stopBits: 'One',                                 // 停止位
  dataBits: 'Eight',                               // 数据位
  fontSize: 14,                                    // 字体大小
  sendCoding: 'UTF-8',                             // 发送编码
  receiveCoding: 'UTF-8',                          // 接收编码
  showNumOfRow: true,                              // 显示行号
  numOfRow: 0,                                     // 行数
  showTime: true,                                  // 显示时间
  autoScroll: true,                                // 自动滚动
  intervalSend: { enable: false, time: undefined, lastTime: 500, intervalId: undefined },  // 循环发送
  endAppend: { enable: true, wrap: '\n' },     // 结尾
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

const transferMatchCode = [`typedef enum {
	Crc,
	ChkSum	
} transfer_t;


class XModem {
	private:
		//delay when receive bytes in frame - 7 secs
		static const int receiveDelay;
		//retry limit when receiving
		static const int rcvRetryLimit;
		//holds readed byte (due to dataAvail())
		int byte;
		//expected block number
		unsigned char blockNo;
		//extended block number, send to dataHandler()
		unsigned long blockNoExt;
		//retry counter for NACK
		int retries;
		//buffer
		char buffer[128];
		//repeated block flag
		bool repeatedBlock;

		int  (*recvChar)(int);
		void (*sendChar)(char);
		bool (*dataHandler)(unsigned long number, char *buffer, int len);
		unsigned short crc16_ccitt(char *buf, int size);
		bool dataAvail(int delay);
		int dataRead(int delay);
		void dataWrite(char symbol);
		bool receiveFrameNo(void);
		bool receiveData(void);
		bool checkCrc(void);
		bool checkChkSum(void);
		bool receiveFrames(transfer_t transfer);
		bool sendNack(void);
		void init(void);
		
		bool transmitFrames(transfer_t);
		unsigned char generateChkSum(void);
		
	public:
		static const unsigned char NACK;
		static const unsigned char ACK;
		static const unsigned char SOH;
		static const unsigned char EOT;
		static const unsigned char CAN;
	
		XModem(int (*recvChar)(int), void (*sendChar)(char));
		XModem(int (*recvChar)(int), void (*sendChar)(char), 
  			        bool (*dataHandler)(unsigned long, char*, int));
		bool receive();
		bool transmit();
		
	
		
};`
,`
#include <stdio.h>
#include <string.h>
	
#include "XModem.h"
#ifdef UTEST
#include "CppUTestExt/MockSupport.h"
#endif
const unsigned char XModem::NACK = 21;
const unsigned char XModem::ACK =  6;

const unsigned char XModem::SOH =  1;
const unsigned char XModem::EOT =  4;
const unsigned char XModem::CAN =  0x18;

const int XModem::receiveDelay=7000;
const int XModem::rcvRetryLimit = 10;




XModem::XModem(int (*recvChar)(int msDelay), void (*sendChar)(char sym))
{
	this->sendChar = sendChar;
	this->recvChar = recvChar;
	this->dataHandler = NULL;
	
}
XModem::XModem(int (*recvChar)(int msDelay), void (*sendChar)(char sym), 
		bool (*dataHandler)(unsigned long number, char *buffer, int len))
{
	this->sendChar = sendChar;
	this->recvChar = recvChar;
	this->dataHandler = dataHandler;
	
}

bool XModem::dataAvail(int delay)
{
	if (this->byte != -1)
		return true;
	if ((this->byte = this->recvChar(delay)) != -1)
		return true;
	else
		return false;
		
}
int XModem::dataRead(int delay)
{
	int b;
	if(this->byte != -1)
	{
		b = this->byte;
		this->byte = -1;
		return b;
	}
	return this->recvChar(delay);
}
void XModem::dataWrite(char symbol)
{
	this->sendChar(symbol);
}
bool XModem::receiveFrameNo()
{
	unsigned char num = 
		(unsigned char)this->dataRead(XModem::receiveDelay);
	unsigned char invnum = 
		(unsigned char)this-> dataRead(XModem::receiveDelay);
	this->repeatedBlock = false;
	//check for repeated block
	if (invnum == (255-num) && num == this->blockNo-1) {
		this->repeatedBlock = true;
		return true;	
	}
	
	if(num != this-> blockNo || invnum != (255-num))
		return false;
	else
		return true;
}
bool XModem::receiveData()
{
	for(int i = 0; i < 128; i++) {
		int byte = this->dataRead(XModem::receiveDelay);
		if(byte != -1)
			this->buffer[i] = (unsigned char)byte;
		else
			return false;
	}
	return true;	
}
bool XModem::checkCrc()
{
	unsigned short frame_crc = ((unsigned char)this->
				dataRead(XModem::receiveDelay)) << 8;
	
	frame_crc |= (unsigned char)this->dataRead(XModem::receiveDelay);
	//now calculate crc on data
	unsigned short crc = this->crc16_ccitt(this->buffer, 128);
	
	if(frame_crc != crc)
		return false;
	else
		return true;
	
}
bool XModem::checkChkSum()
{
	unsigned char frame_chksum = (unsigned char)this->
						dataRead(XModem::receiveDelay);
	//calculate chksum
	unsigned char chksum = 0;
	for(int i = 0; i< 128; i++) {
		chksum += this->buffer[i];
	}
	if(frame_chksum == chksum)
		return true;
	else
		return false;
}
bool XModem::sendNack()
{
	this->dataWrite(XModem::NACK);	
	this->retries++;
	if(this->retries < XModem::rcvRetryLimit)
		return true;
	else
		return false;
	
}
bool XModem::receiveFrames(transfer_t transfer)
{
	this->blockNo = 1;
	this->blockNoExt = 1;
	this->retries = 0;
	while (1) {
		char cmd = this->dataRead(100);
		switch(cmd){
			case XModem::SOH:
				if (!this->receiveFrameNo()) {
					if (this->sendNack())
						break;
					else
						return false;
				}
				if (!this->receiveData()) {	
					if (this->sendNack())
						break;
					else
						return false;
					
				};
				if (transfer == Crc) {
					if (!this->checkCrc()) {
						if (this->sendNack())
							break;
						else
							return false;
					}
				} else {
					if(!this->checkChkSum()) {
						if (this->sendNack())
							break;
						else
							return false;
					}
				}
				//callback
				if(this->dataHandler != NULL && 
				   this->repeatedBlock == false)
					if(!this->dataHandler(this->blockNoExt, 
							  this->buffer, 128)) {
						return false;
					}
				//ack
				this->dataWrite(XModem::ACK);
				if(this->repeatedBlock == false)
				{
					this->blockNo++;
					this->blockNoExt++;
				}
			   	
				break;
			case XModem::EOT:
				this->dataWrite(XModem::ACK);
				return true;
			case XModem::CAN:
				//wait second CAN
				if(this->dataRead(XModem::receiveDelay) ==
						XModem::CAN) {
					this->dataWrite(XModem::ACK);
					//this->flushInput();
					return false;
				}
				//something wrong
				this->dataWrite(XModem::CAN);
				this->dataWrite(XModem::CAN);
				this->dataWrite(XModem::CAN);
				return false;
			default:
				//something wrong
				this->dataWrite(XModem::CAN);
				this->dataWrite(XModem::CAN);
				this->dataWrite(XModem::CAN);
				return false;
		}
		
	}
}
void XModem::init()
{
	//set preread byte  	
	this->byte = -1;
}
bool XModem::receive()
{
	this->init();
	
	for (int i =0; i <  16; i++)
	{
		this->dataWrite('C');	
		if (this->dataAvail(1000)) 
			return receiveFrames(Crc);
	
	}
	for (int i =0; i <  16; i++)
	{
		this->dataWrite(XModem::NACK);	
		if (this->dataAvail(1000)) 
			return receiveFrames(ChkSum);
	}

}
unsigned short XModem::crc16_ccitt(char *buf, int size)
{
	unsigned short crc = 0;
	while (--size >= 0) {
		int i;
		crc ^= (unsigned short) *buf++ << 8;
		for (i = 0; i < 8; i++)
			if (crc & 0x8000)
				crc = crc << 1 ^ 0x1021;
			else
				crc <<= 1;
	}
	return crc;
}
unsigned char XModem::generateChkSum(void)
{
	//calculate chksum
	unsigned char chksum = 0;
	for(int i = 0; i< 128; i++) {
		chksum += this->buffer[i];
	}
	return chksum;
	
}

bool XModem::transmitFrames(transfer_t transfer)
{
	this->blockNo = 1;
	this->blockNoExt = 1;
	// use this only in unit tetsing
	//memset(this->buffer, 'A', 128);
	while(1)
	{
		//get data
		if (this->dataHandler != NULL)
		{
			if( false == 
			    this->dataHandler(this->blockNoExt, this->buffer, 
			    128))
			{
				//end of transfer
				this->sendChar(XModem::EOT);
				//wait ACK
				if (this->dataRead(XModem::receiveDelay) == 
					XModem::ACK)
					return true;
				else
					return false;

			}			
			
		}
		else
		{
			//cancel transfer - send CAN twice
			this->sendChar(XModem::CAN);
			this->sendChar(XModem::CAN);
			//wait ACK
			if (this->dataRead(XModem::receiveDelay) == 
				XModem::ACK)
				return true;
			else
				return false;
		}
		//send SOH
		this->sendChar(XModem::SOH);
		//send frame number	
		this->sendChar(this->blockNo);
		//send inv frame number
		this->sendChar((unsigned char)(255-(this->blockNo)));
		//send data
		for(int i = 0; i <128; i++)
			this->sendChar(this->buffer[i]);
		//send checksum or crc
		if (transfer == ChkSum) {
			this->sendChar(this->generateChkSum());
		} else {
			unsigned short crc;
			crc = this->crc16_ccitt(this->buffer, 128);
			
			this->sendChar((unsigned char)(crc >> 8));
			this->sendChar((unsigned char)(crc));
			 
		}
		//TO DO - wait NACK or CAN or ACK
		int ret = this->dataRead(XModem::receiveDelay);
		switch(ret)
		{
			case XModem::ACK: //data is ok - go to next chunk
				this->blockNo++;
				this->blockNoExt++;
				continue;
			case XModem::NACK: //resend data
				continue;
			case XModem::CAN: //abort transmision
				return false;

		}
	
	}
	return false;
}
bool XModem::transmit()
{
	int retry = 0;
	int sym;
	this->init();
	
	//wait for CRC transfer
	while(retry < 32)
	{
		if(this->dataAvail(1000))
		{
			sym = this->dataRead(1); //data is here - no delay
			if(sym == 'C')	
				return this->transmitFrames(Crc);
			if(sym == XModem::NACK)
				return this->transmitFrames(ChkSum);
		}
		retry++;
	}	
	return false;
}

`];

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
  message.warning('功能未实现');
}

const handleUploadChange = (data) => {
  fileListRef.value = data.fileList
}
const handleUploadRemove = ({ file }) => {
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
  const { serialPort, baudRate, parity, stopBits, dataBits } = settings;
  return serialPort && baudRate && parity && stopBits && dataBits;
})

const getSerialPort = async () => {
  const ports = await SerialPort.available_ports();
  console.log("Available ports:", ports);
  settings.derives = Object.keys(ports).filter(v => !v.startsWith('/dev/cu.')).sort().map(key => ({
    label: key,
    value: key
  }));
}


const port = new SerialPort({
      dataBits: settings.dataBits,
      stopBits: settings.stopBits,
      parity: settings.parity,
      flowControl:  'None',
    });


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

  // const response = await fetch('http://127.0.0.1:7878/api/fs/list').then(res=>res.json());
  // console.log(response);
  
  try {
    
    await port.change({
      path: settings.serialPort,        // 串口路径
      baudRate: settings.baudRate,      // 波特率
    })
    port.disconnected(async () => {
      closeSerialPort();
    });
    // port = await Binding.open({
    //   path: settings.serialPort,        // 串口路径
    //   baudRate: settings.baudRate,      // 波特率
    //   dataBits: settings.dataBits,      // 数据位
    //   stopBits: settings.stopBits,      // 停止位
    //   parity: settings.parity,          // 校验位：奇偶校验
    //   lock: true,                       // 防止其他进程打开端口。Windows目前不支持false。默认为true
    //   rtscts: false,                    // 流控制设置。默认为false
    //   xon: false,                       // 流控制设置。默认为false
    //   xoff: false,                      // 流控制设置。默认为false
    //   xany: false,                      // 流控制设置。默认为false
    //   hupcl: true,                      // 关闭DTR。默认为true
    //   vmin: 1,                          // 默认为1。读取到一个数据返回
    //   vtime: 0,                         // 默认为0。否则阻塞等待
    // });
  } catch (e) {
    message.error('串口打开失败！请确认串口是否已经连接');
    return;
  }

  settings.serialPortOpenLoading = true;
  Promise.race([
    port.open(),
    new Promise((_, reject) => setTimeout(reject, 1000))
  ]).then(() => {
    settings.serialPortOpenLoading = false;
    settings.serialPortOpened = true;
    readData().then();
  }).catch((error) => {
      console.error("Error opening serial port:", error);
      settings.serialPortOpenLoading = false;
      settings.serialPortOpened = false;
      window.$message.error('串口打开失败！串口可能被其它程序占用');
  });
}

const closeSerialPort = async () => {
  try {
    if (port){
      settings.serialPortOpenLoading = true;
      port.close();
    }
    settings.serialPortOpenLoading = settings.serialPortOpened = false;
  } catch (error) {
    settings.serialPortOpenLoading = false;
    message.error("Error closing serial port:", error);
  }
}

const readData = async () => {
  await port.startListening();
  await port.listen((data) => {
        console.log("Received:", data);
        communications.receive.push({
          datetime: new Date().getTime(),
          data: data,
          ...convertBinary(data),
        });
  });
};


const convertBinary = (data) => {
   const uint8Array = new TextEncoder().encode(data);
  return {
    'ASCII': uint8ArrayToAscii(uint8Array).replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    'HEX': uint8ArrayToHex(uint8Array).toUpperCase().replace(/(.{2})/g, '<span class="HEX" style="cursor: pointer">$1</span> '),
    'UTF-8': new TextDecoder('utf-8').decode(uint8Array),
    'GBK': safeTextDecode(uint8Array, 'gbk'),
  };
};

// 安全的ASCII转换
const uint8ArrayToAscii = (uint8Array) => {
  return Array.from(uint8Array)
    .map(byte => byte <= 127 ? String.fromCharCode(byte) : '�')
    .join('');
};

// 十六进制转换
const uint8ArrayToHex = (uint8Array) => {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

// 安全的GBK解码
const safeTextDecode = (uint8Array, encoding) => {
  try {
    return new TextDecoder(encoding).decode(uint8Array);
  } catch (error) {
    console.warn(`Failed to decode as ${encoding}:`, error);
    return '解码失败';
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
    receiveScroll.value.scrollBy({ top: document.querySelector('.receive-data').offsetHeight/*, behavior: 'smooth'*/ })
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
      const { x, y } = {
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
  if (!settings.serialPortOpened) return message.warning('串口还未开启');
  communications.send.status = communications.send.text ? undefined : 'error';
  if (!communications.send.text.trim()) return;
  
  let str = communications.send.text.trim();
  let data, sendData;
  
  try {
    switch (settings.sendCoding) {
      case 'UTF-8':
        data = new TextEncoder().encode(communications.send.text);
        break;
      case 'GBK':
        try {
          data = new TextEncoder('gbk').encode(communications.send.text);
        } catch (error) {
          // 如果不支持GBK编码，回退到UTF-8
          message.warning('GBK encoding not supported, falling back to UTF-8');
          data = new TextEncoder().encode(communications.send.text);
        }
        break;
      case 'HEX':
        // 清理输入：移除空格和非十六进制字符
        const cleanHex = communications.send.text.replace(/\s/g, '').toUpperCase();
        if (!cleanHex.length) {
          return message.error('请输入十六进制字符串');
        }
        // 检查是否为有效的十六进制字符串
        if (!/^[0-9A-F]+$/i.test(cleanHex)) {
          return message.warning('请检查是否包含非十六进制字符');
        }
        // 确保长度为偶数
        const hexString = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex;
        // 转换为字节数组
        const hexBytes = [];
        for (let i = 0; i < hexString.length; i += 2) {
          hexBytes.push(parseInt(hexString.substring(i, 2), 16));
        }
        data = new Uint8Array(hexBytes);
        break;
      case 'ASCII':
        // 检查是否包含非ASCII字符
        const text = communications.send.text;
        let nonAsciiCount = 0;
        const asciiBytes = [];
        for (let i = 0; i < text.length; i++) {
          const charCode = text.charCodeAt(i);
          if (charCode > 127) {
            nonAsciiCount++;
            asciiBytes.push(63); // '?' 字符的ASCII码
          } else {
            asciiBytes.push(charCode);
          }
        }
        if (nonAsciiCount >= 3) {
          message.warning('输入的不是ASCII字符串，请检查输入内容');
        }
        data = new Uint8Array(asciiBytes);
        break;
      default:
        data = new TextEncoder().encode(communications.send.text);
    }

    // 添加结尾字符
    if (settings.endAppend.enable) {
      const endBytes = new TextEncoder().encode(settings.endAppend.wrap);
      sendData = new Uint8Array(data.length + endBytes.length);
      sendData.set(data);
      sendData.set(endBytes, data.length);
    } else {
      sendData = data;
    }

    // 发送数据
    await port.writeBinary(sendData);
    sendDataToDisplay(str);

    // 定时发送
    if (settings.intervalSend.enable) {
      settings.intervalSend.intervalId = setInterval(async () => {
        if (!settings.intervalSend.enable || !settings.serialPortOpened) {
          clearInterval(settings.intervalSend.intervalId);
          return;
        }
        try {
          await port.writeBinary(sendData);
          sendDataToDisplay(str);
        } catch (error) {
          console.error('Interval send error:', error);
          clearInterval(settings.intervalSend.intervalId);
        }
      }, settings.intervalSend.time);
    } else {
      communications.send.text = '';
    }
    
  } catch (e) {
    console.log('writeData------->>>', e);
    message.error('发送数据失败: ' + e.message);
    closeSerialPort();
  }
};

const sendDataToDisplay = (data) => {
  communications.receive[communications.receive.length] = {
    datetime: new Date().getTime(),
    isSend: true,
    data: data,
    ...convertBinary(data)
  }
}

// eslint-disable-next-line no-unused-vars
const copy = async(text) => {
  await writeText(text);
  message.success('复制成功');
  clickHex(false);
}


const copyTransferCode = async(code) => {
  await writeText(code);
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

.msg-body *{
  user-select: auto;          /* 标准属性 */
  -webkit-user-select: auto;  /* Webkit (Chrome, Safari) */
  -ms-user-select: auto;      /* IE/Edge */
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

.page-right>div {
  border-radius: 10px;
  background-color: var(--vt-c-bg-card);
  padding: 10px;
  box-sizing: border-box;
}

.page-right>.page-right-top {
  height: calc(100% - 240px - 30px);
  position: relative;
  padding-top: 50px;
}

.page-right>.page-right-top>.tool-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  left: 10px;
  top: 10px;
  right: 10px;
  padding-bottom: 10px;
}

.page-right>.page-right-bottom {
  height: 240px;
}


.page-right>.page-right-bottom>.send-content {
  height: calc(100% - 40px);
}

.page-right>.page-right-bottom>.send-tool {
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

.hex-show>div {
  width: 50%;
}

.hex-show>div:nth-child(1) {
  text-align: left;
}

.hex-show>div:nth-child(2) {
  text-align: left;
}

.receive-data {
  font-family: monospace;
  white-space: pre-wrap;
}

.active-green:active {
  color: #7fe7c4;
}
</style>
