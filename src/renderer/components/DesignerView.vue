<i18n>
{
  "en": {
    "add": "Add action",
    "save": "Save file",
    "open": "Open file...",
    "compile": "Compile",
    "download": "Flash actions",
    "scanBle": "Scan xRobot",
    "bleDisconnect": "Disconnect",
    "selectRobot": "Select a xRobot",
    "saveName": "Save name",
    "rotate": "1 - Rotate",
    "sleep": "2 - Sleep",
    "goto": "3 - Goto",
    "command": "Command",
    "value": "Value",
    "time": "Time",
    "edit": "Edit",
    "cancel": "Cancel",
    "confirm": "OK",
    "timeRequire": "Time could not be empty",
    "timeInt": "Time should be integer",
    "timeRange": "Time should be in range [0, 65535]",
    "rotatePositive": "Rotate value should be positive integer",
    "rotaterange": "Rotate value should be in range [0, 360]",
    "sleepint": "Sleep time value (ms) should be positive integer",
    "sleeprange": "Sleep time value (ms) should be in range (0, 65535]",
    "valuenull": "Value field should not be null",
    "fileerror": "An error ocurred creating the file %{err}",
    "saveok": "The file has been succesfully saved",
    "readfailed": "An error ocurred reading the file: %{err}",
    "compileok": "Compile success",
    "compilefirst": "Please compile the action first!",
    "connectfirst": "Connect xRobot BLE first!",
    "addaction": "Add action",
    "saveaction": "Save action"
  },
  "zh-CN": {
    "add": "添加动作",
    "save": "保存文件",
    "open": "打开文件",
    "compile": "编译动作",
    "download": "下载动作",
    "scanBle": "扫描蓝牙",
    "bleDisconnect": "断开蓝牙",
    "selectRobot": "选择xRobot",
    "saveName": "保存的名称",
    "rotate": "1 - 转动",
    "sleep": "2 - 等待",
    "goto": "3 - 跳转",
    "command": "指令",
    "value": "指令值",
    "time": "时间",
    "edit": "修改动作",
    "cancel": "取消",
    "confirm": "确定",
    "timeRequire": "时间不能为空",
    "timeInt": "时间必须为整数",
    "timeRange": "时间范围必须为[0, 65535]",
    "rotatePositive": "转动角度必须为正数",
    "rotaterange": "转动角度范围必须为[0, 360]",
    "sleepint": "暂停时间必须为正数",
    "sleeprange": "暂停时间必须在[0, 65535]",
    "valuenull": "字段不能为空",
    "fileerror": "创建文件失败: %{err}",
    "saveok": "保存成功",
    "readfailed": "读取文件失败: %{err}",
    "compileok": "编译成功",
    "compilefirst": "请先编译该文件!",
    "connectfirst": "请先连接xRobot!",
    "addaction": "添加动作",
    "saveaction": "保存动作"
  }
}
</i18n>

<template>
  <v-container fluid class="pa-0 ma-0">
    <v-layout row>
      <v-flex xs12>
        <v-toolbar color="grey darken-4" dense flat class="mb-2">
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="showAddAction">
              <v-icon>add</v-icon>
            </v-btn>
            <span>{{ $t('add') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="saveActions">
              <v-icon>save</v-icon>
            </v-btn>
            <span>{{ $t('save') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="loadActions">
              <v-icon>folder_special</v-icon>
            </v-btn>
            <span>{{ $t('open') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" :loading="ui.compiling" icon @click="compile">
              <v-icon>build</v-icon>
            </v-btn>
            <span>{{ $t('compile') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" :loading="ui.compiling" icon @click="sendActions">
              <v-icon>vertical_align_bottom</v-icon>
            </v-btn>
            <span>{{ $t('download') }}</span>
          </v-tooltip>
        </v-toolbar>
      </v-flex>
    </v-layout>
    <v-layout row class="mt-1 mx-2" v-for="(servo, idx) in servos" :key="idx">
      <v-flex xs12 style="overflow: auto">
        <div style="display: flex; flex: 1">
          <div style="display: flex; margin-right: 5px; cursor: pointer" @click="selected = idx">
            <v-card :class="servo.color" dark title flat style="width: 80px; text-align: center;">
              <v-card-text>
                <span class="title servo-number">{{ servo.title }}</span>
                <v-icon style="font-size: 1.5em" v-if="idx === selected">edit</v-icon>
              </v-card-text>
            </v-card>
          </div>
          <draggable v-model="servo.commands" style="display: flex; background-color: #666">
            <div style="display: flex; background-color: #666" v-for="(action, index) in servo.commands" :key="index">
              <div style="display: flex; flex-flow: column wrap; justify-content: space-between; margin-right: 1px"
                class="lighten-2"
                :class="servo.color"
                :style="actionWidth(action)"
              >
                <div style="align-items: center; justify-content: center; display: flex; flex-grow: 1; cursor: pointer"
                  class="lighten-1"
                  :class="servo.color"
                  @dblclick="editAction(action)"
                >{{ index + 1}}</div>
                <div style="align-items: center; justify-content: center; display: flex; flex-grow: 1; margin: 5px 0">
                  <div style="display: flex flex-flow: column wrap">
                    <div>
                      <v-icon style="margin-right: 5px; font-size: 1.3em">
                        {{ cmdIcon(action.cmd) }}
                      </v-icon>{{ cmdValue(action) }}</div>
                    <div><v-icon style="margin-right: 5px; font-size: 1.3em">av_timer</v-icon>
                      {{ action.cmd === 1 ? action.time + 'ms' : '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </draggable>
        </div>
      </v-flex>
    </v-layout>

    <generic-dialog
      :cancel="$t('cancel')"
      :confirm="$t('confirm')"
      :show="genericDialog.show"
      :title="genericDialog.title"
      :fields="genericDialog.fields"
      :maxWidth="genericDialog.maxWidth"
      :userInfo="genericDialog.userInfo"
      :validators="validators"
      @cancel="genericDialog.show = false"
      @confirm="dialogSave"
    ></generic-dialog>
  </v-container>
</template>

<script>
  import GenericDialog from './GenericDialog'
  import * as binutil from '@/utils/binutil'
  import * as types from '@/store/types'
  import draggable from 'vuedraggable'
  import BaseView from './BaseView'
  import fs from 'fs'

  let MIN_LENGTH = 80
  let MAX_LENGTH = 1200
  let MAX_SECS = 30000
  let TIME_SLICE = (MAX_LENGTH - MIN_LENGTH) / MAX_SECS

  export default {
    name: 'designer',

    extends: BaseView,

    components: {
      GenericDialog,
      draggable
    },

    computed: {
      createFields () {
        return {
          cmd: {
            type: 'choice',
            choices: [
              { text: this.$t('rotate'), value: 1 },
              { text: this.$t('sleep'), value: 2 },
              { text: this.$t('goto'), value: 3 }
            ],
            value: null,
            textType: 'number',
            label: this.$t('command'),
            required: true
          },
          value: {
            type: 'text',
            value: null,
            textType: 'number',
            label: this.$t('value'),
            required: true,
            rules: [
              v => !!v || this.$t('valuenull')
            ]
          },
          time: {
            type: 'text',
            value: null,
            textType: 'number',
            label: this.$t('time'),
            required: false
          }
        }
      }
    },

    data () {
      return {
        validators: [
          (payload) => {
            if (payload.cmd === 1) {
              // Rotate
              if (!payload.time) {
                return this.$t('timeRequire')
              }

              if (!/^\d+$/.test(payload.time)) {
                return this.$t('timeInt')
              }

              if (parseInt(payload.time) <= 0 || parseInt(payload.time) > 65535) {
                return this.$t('timeRange')
              }

              if (!/^\d+$/.test(payload.value)) {
                return this.$t('rotatePositive')
              }

              if (parseInt(payload.value) > 360 || parseInt(payload.value) < 0) {
                return this.$t('rotaterange')
              }
            } else if (payload.cmd === 2) {
              // Sleep
              if (!/^\d+$/.test(payload.value)) {
                return this.$t('')
              }

              if (parseInt(payload.value) > 65535 || parseInt(payload.value) <= 0) {
                return this.$t('sleeprange')
              }
            } else if (payload.cmd === 3) {
              // Goto

            }

            return true
          }
        ],

        compileBuffer: null,

        ui: {
          compiling: false
        },

        saveFields: {
          value: {
            type: 'text',
            value: null,
            textType: 'text',
            label: 'saveName',
            required: true
          }
        },
        selected: 0,
        servos: [
          { index: 0, title: '#1', color: 'deep-purple', commands: [] },
          { index: 1, title: '#2', color: 'indigo', commands: [] },
          { index: 2, title: '#3', color: 'blue', commands: [] },
          { index: 3, title: '#4', color: 'light-blue', commands: [] },
          { index: 4, title: '#5', color: 'cyan', commands: [] },
          { index: 5, title: '#6', color: 'teal', commands: [] },
          { index: 6, title: '#7', color: 'green', commands: [] },
          { index: 7, title: '#8', color: 'light-green', commands: [] },
          { index: 8, title: '#9', color: 'lime', commands: [] },
          { index: 9, title: '#10', color: 'amber', commands: [] },
          { index: 10, title: '#11', color: 'orange', commands: [] },
          { index: 11, title: '#12', color: 'deep-orange', commands: [] },
          { index: 12, title: '#13', color: 'red', commands: [] },
          { index: 13, title: '#14', color: 'pink', commands: [] },
          { index: 14, title: '#15', color: 'purple', commands: [] },
          { index: 15, title: '#16', color: 'brown', commands: [] }
        ]
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },

      cmdValue (item) {
        switch (item.cmd) {
          case 1:
            return `${item.value}˚`
          case 2:
            return `${item.value}ms`
          case 3:
            return `${item.value}`
        }
      },

      cmdIcon (cmd) {
        switch (cmd) {
          case 1:
            return 'rotate_right'
          case 2:
            return 'timer'
          case 3:
            return 'call_split'
        }
      },

      actionWidth (item) {
        switch (item.cmd) {
          case 1:
            return `width: ${item.time * TIME_SLICE + MIN_LENGTH}px`
          case 2:
            return `width: ${item.value * TIME_SLICE + MIN_LENGTH}px`
          case 3:
            return `width: ${MIN_LENGTH}px`
        }
      },

      selectedStyle (idx) {
        if (idx === this.selected) {
          return 'background: #eee'
        }

        return ''
      },

      showAddAction () {
        this.showGenericDialog(this.createFields, { action: 'add' }, this.$t('addaction'))
      },

      showSaveDialog () {
        this.showGenericDialog(this.saveFields, { action: 'save' }, this.$t('saveaction'))
      },

      dialogSave (res) {
        this.genericDialog.show = false
        let userInfo = res.userInfo
        if (userInfo.action === 'add') {
          // Add action
          let payload = res.payload
          let servo = this.servos[this.selected]
          let action = {
            cmd: parseInt(payload.cmd),
            time: parseInt(payload.time),
            value: parseInt(payload.value || 0)
          }
          servo.commands.push(action)
        } else if (userInfo.action === 'edit') {
          let payload = res.payload
          let action = userInfo.item
          action.cmd = parseInt(payload.cmd)
          action.time = parseInt(payload.time)
          action.value = parseInt(payload.value || 0)
        }
      },

      saveActions () {
        let content = JSON.stringify(this.servos)
        let dialog = this.$electron.remote.dialog
        dialog.showSaveDialog((fileName) => {
          if (fileName === undefined) {
            return
          }

          // fileName is a string that contains the path and filename created in the save file dialog.
          fs.writeFile(fileName, content, (err) => {
            if (err) {
              this.showError(this.$t('fileerror', {err: err.message}))
            }

            this.showInfo(this.$t('saveok'))
          })
        })
      },

      loadActions () {
        let dialog = this.$electron.remote.dialog
        dialog.showOpenDialog({filters: [{name: 'JSON', extensions: ['json']}], properties: ['openFile']}, (fileNames) => {
          if (fileNames === undefined || fileNames.length !== 1) {
            // no file selected
            return
          }

          let filepath = fileNames[0]

          fs.readFile(filepath, 'utf-8', (err, data) => {
            if (err) {
              let msg = this.$t('readfailed', {err: err.message})
              this.showMessage(msg, 'error')
              return
            }

            let actions = JSON.parse(data)
            for (let idx in actions) {
              this.servos[idx].commands = actions[idx].commands
            }
          })
        })
      },

      compile () {
        let indexes = []
        let data = []
        let pos = 0

        this.ui.compiling = true
        for (let servo of this.servos) {
          for (let action of servo.commands) {
            data.push(action.cmd)
  
            let timeh = (action.time & 0xFF00) >> 8
            let timel = action.time & 0x00FF
            data.push(timeh)
            data.push(timel)

            let valueh = (action.value & 0xFF00) >> 8
            let valuel = action.value & 0x00FF
            data.push(valueh)
            data.push(valuel)
            pos += 5
          }

          let posh = (pos & 0xFF00) >> 8
          let posl = pos & 0x00FF
          indexes.push(posh)
          indexes.push(posl)
        }

        indexes = indexes.concat(data)
  
        this.ui.compiling = false
        this.$store.commit(types.LOG_ADD_ENTRY, this.$t('compileok'))
        this.showMessage(this.$t('compileok'), 'success')

        this.compileBuffer = binutil.buildFrame(binutil.FrameCmdSetDMA, indexes)
      },

      sendActions () {
        if (this.$store.state.ble.connected) {
          // Send data to ble
          if (this.compileBuffer === null || this.compileBuffer.length === 0) {
            this.showError(this.$t('compilefirst'))
            return
          }

          this.$store.commit(types.LOG_ADD_ENTRY, this.compileBuffer)
          this.$store.commit(types.BLE_SEND_DATA, this.compileBuffer)
        } else {
          this.showError(this.$t('connectfirst'))
        }
      },

      editAction (action) {
        this.createFields.cmd.value = action.cmd
        this.createFields.value.value = action.value
        this.createFields.time.value = action.time
        this.showGenericDialog(this.createFields, { action: 'edit', item: action }, this.$t('edit'))
      }
    }
  }
</script>

<style scoped>
  .servo-icon {
    font-size: 19px
  }
  .servo-number {
    vertical-align: middle
  }
</style>
