<template>
  <v-container fluid class="pa-0 ma-0">
    <v-layout row>
      <v-flex xs12>
        <v-toolbar color="grey darken-4" dense flat class="mb-2">
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="showAddAction">
              <v-icon>add</v-icon>
            </v-btn>
            <span>{{ $t('designer.add') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="saveActions">
              <v-icon>save</v-icon>
            </v-btn>
            <span>{{ $t('designer.save') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="loadActions">
              <v-icon>folder_special</v-icon>
            </v-btn>
            <span>{{ $t('designer.open') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" :loading="ui.compiling" icon @click="compile">
              <v-icon>build</v-icon>
            </v-btn>
            <span>{{ $t('designer.compile') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" :loading="ui.compiling" icon @click="sendActions">
              <v-icon>vertical_align_bottom</v-icon>
            </v-btn>
            <span>{{ $t('designer.download') }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="bleDidClick">
              <v-icon>{{ bleIcon() }}</v-icon>
            </v-btn>
            <span>{{ bleTip() }}</span>
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

    <peripheral-picker-dialog
      :title="$t('designer.selectRobot')"
      :show="ui.ble.show"
      :items="ble.peripherals"
      @close="closePeripheralDialog"
      @discover="discover"
    />

    <generic-dialog
      :cancel="$t('constants.cancel')"
      :confirm="$t('constants.confirm')"
      :show="genericDialog.show"
      :title="genericDialog.title"
      :fields="genericDialog.fields"
      :maxWidth="genericDialog.maxWidth"
      :userInfo="genericDialog.userInfo"
      :validators="validators"
      @cancel="genericDialog.show = false"
      @confirm="dialogSave"
    ></generic-dialog>

    <v-snackbar
      top
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      v-model="snackbar.show"
    >
      {{ snackbar.text }}
      <v-spacer></v-spacer>
      <v-btn flat small @click.native="snackbar.show = false">CLOSE</v-btn>
    </v-snackbar>

    <!-- Modal dialog -->
    <template>
      <v-layout row justify-center>
        <v-dialog v-model="alert.show" persistent max-width="400">
          <v-card>
            <v-card-title class="headline">{{ alert.title }}</v-card-title>
            <v-card-text>{{ alert.body }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" flat @click.native="alert.callback(false)">{{ $t('constants.cancel') }}</v-btn>
              <v-btn color="green darken-1" flat @click.native="alert.callback(true)">{{ $t('constants.confirm') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </template>
  </v-container>
</template>

<script>
  import PeripheralPickerDialog from './BLE/PeripheralPickerDialog'
  import GenericDialog from './GenericDialog'
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
      PeripheralPickerDialog,
      draggable
    },

    data () {
      return {
        ble: {
          connected: false,
          connectedPeripheral: null,
          characteristics: [],
          peripherals: []
        },

        validators: [
          (payload) => {
            console.log(this)
            if (payload.cmd === 1) {
              // Rotate
              if (!payload.time) {
                return 'Time could not be empty'
              }

              if (!/^\d+$/.test(payload.time)) {
                return 'Time should be integer'
              }

              if (parseInt(payload.time) <= 0 || parseInt(payload.time) > 65535) {
                return 'Time should be in range [0, 65535]'
              }

              if (!/^\d+$/.test(payload.value)) {
                return 'Rotate value should be positive integer'
              }

              if (parseInt(payload.value) > 360 || parseInt(payload.value) < 0) {
                return 'Rotate value should be in range [0, 360]'
              }
            } else if (payload.cmd === 2) {
              // Sleep
              if (!/^\d+$/.test(payload.value)) {
                return 'Sleep time value (ms) should be positive integer'
              }

              if (parseInt(payload.value) > 65535 || parseInt(payload.value) <= 0) {
                return 'Sleep time value (ms) should be in range (0, 65535]'
              }
            } else if (payload.cmd === 3) {
              // Goto

            }

            return true
          }
        ],

        compileBuffer: null,

        ui: {
          compiling: false,
          ble: {
            show: false
          }
        },

        saveFields: {
          value: {
            type: 'text',
            value: null,
            textType: 'text',
            label: this.$t('designer.saveName'),
            required: true
          }
        },
        createFields: {
          cmd: {
            type: 'choice',
            choices: [
              { text: this.$t('designer.rotate'), value: 1 },
              { text: this.$t('designer.sleep'), value: 2 },
              { text: this.$t('designer.goto'), value: 3 }
            ],
            value: null,
            textType: 'number',
            label: this.$t('designer.command'),
            required: true
          },
          value: {
            type: 'text',
            value: null,
            textType: 'number',
            label: this.$t('designer.value'),
            required: true,
            rules: [
              v => !!v || 'Value field should not be null'
            ]
          },
          time: {
            type: 'text',
            value: null,
            textType: 'number',
            label: this.$t('designer.time'),
            required: false
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
        this.showGenericDialog(this.createFields, { action: 'add' }, 'Add Action')
      },

      showSaveDialog () {
        this.showGenericDialog(this.saveFields, { action: 'save' }, 'Save action')
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
              alert('An error ocurred creating the file ' + err.message)
            }

            alert('The file has been succesfully saved')
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
              let msg = 'An error ocurred reading the file :' + err.message
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
        let arr = new Uint8Array(indexes)
  
        this.ui.compiling = false
        console.log('compile success')
        this.showMessage('编译成功', 'success')

        this.compileBuffer = arr
      },

      closePeripheralDialog (e) {
        this.ui.ble.show = false
        if (e.peripheral) {
          this.connectPeripheral(e.peripheral)
        }
      },

      connectPeripheral (peripheral) {
        peripheral.connect((err) => {
          if (err) {
            console.error(err)
            this.showMessage('Failed to connect peripheral', 'error')
            this.ble.connected = false
            this.ble.connectedPeripheral = null
            return
          }

          peripheral.discoverAllServicesAndCharacteristics((err, services, characteristics) => {
            if (err) {
              console.error(err)
              this.showMessage('Failed to connect peripheral', 'error')
              this.ble.connected = false
              this.ble.connectedPeripheral = null
              this.ble.characteristics = []
            } else {
              this.ble.connected = true
              this.ble.connectedPeripheral = peripheral
              this.ble.characteristics = characteristics
              console.log('Peripheral connected')
            }
          })
        })
      },

      discover (e) {
        let peripheral = e.peripheral
        this.ble.peripherals.push(peripheral)
      },

      sendActions () {
        if (this.ble.connectedPeripheral) {
          // Send data to ble
          if (this.compileBuffer === null || this.compileBuffer.length === 0) {
            this.showMessage('Please compile the action first!', 'error')
            return
          }

          let charac = this.ble.characteristics[0]
          let buffer = Buffer.from(this.compileBuffer.buffer)
          console.log(buffer)
          charac.write(buffer, true, (error) => {
            if (error) {
              console.error(error)
              this.showMessage('Failed to send data to xRobot', 'error')
            } else {
              this.showMessage('Action file has sent to xRobot', 'success')
            }
          })
        } else {
          this.showMessage('Connect xRobot BLE first!', 'error')
        }
      },

      bleIcon () {
        if (!this.ble.connected) {
          return 'bluetooth'
        } else {
          return 'bluetooth_connected'
        }
      },

      bleTip () {
        if (this.ble.connected) {
          return this.$t('designer.bleDisconnect')
        } else {
          return this.$t('designer.scanBle')
        }
      },

      bleDidClick () {
        if (this.ble.connectedPeripheral) {
          this.showConfirmAlert('Warning', 'Are you sure to disconnect xRobot?', confirm => {
            if (!confirm) return

            this.ble.connectedPeripheral.disconnect(err => {
              if (err) {
                this.showMessage('Failed to disconnect xRobot', 'error')
              } else {
                this.ble.connected = false
                this.ble.connectedPeripheral = null
                this.ble.characteristics = []
              }
            })
          })
        } else {
          this.ui.ble.show = true
        }
      },

      editAction (action) {
        this.createFields.cmd.value = action.cmd
        this.createFields.value.value = action.value
        this.createFields.time.value = action.time
        this.showGenericDialog(this.createFields, { action: 'edit', item: action }, this.$t('designer.edit'))
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
