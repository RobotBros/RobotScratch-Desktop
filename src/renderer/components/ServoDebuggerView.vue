<template>
  <v-container grid-list-md fluid class="pa-0 ma-0">
    <!-- Toolbar -->
    <v-layout row>
      <v-flex xs12>
        <v-toolbar color="grey darken-4" dense flat class="mb-2">
          <!-- BLE -->
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="bleDidClick">
              <v-icon>{{ bleIcon() }}</v-icon>
            </v-btn>
            <span>{{ bleTip() }}</span>
          </v-tooltip>

          <!-- Send data -->
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="sendData">
              <v-icon>send</v-icon>
            </v-btn>
            <span>{{ $t('action.send') }}</span>
          </v-tooltip>
          
        </v-toolbar>
      </v-flex>
    </v-layout>

    <v-layout wrap row class="px-2">
      <v-flex xs3 v-for="(servo, idx) in servos" :key="idx">
        <v-card>
          <v-card-title :class="`${servo.color} lighten-1`">
            <v-layout>
              <v-flex xs2>
                <v-menu dark offset-y>
                  <v-btn
                    slot="activator"
                    class="ma-0"
                    dark
                    icon
                    flat
                    small
                  >
                    <v-icon>more_vert</v-icon>
                  </v-btn>
                  <v-list>
                    <v-list-tile
                      v-for="(item, index) in menus"
                      :key="index"
                      @click.prevent="item.action(servo)"
                    >
                      <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-flex>
              <v-flex xs8>
                <div class="servo-title subheading">{{ servo.title }}</div>
              </v-flex>
              <v-flex xs2>
                <v-switch
                  v-model="servo.selected"
                  color="white"
                  hide-details
                ></v-switch>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text>
            <v-text-field
              prepend-icon="rotate_right"
              append-icon="˚"
              label="Target Degree (n˚)"
              type="number"
              solo-inverted
              v-model="servo.props.degree"
            />

            <v-text-field
              prepend-icon="timer"
              append-icon="''"
              label="Duration (ms)"
              type="number"
              solo-inverted
              v-model="servo.props.duration"
            />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <peripheral-picker-dialog
      :title="$t('designer.selectRobot')"
      :show="ui.ble.show"
      :items="ble.peripherals"
      @close="closePeripheralDialog"
      @discover="discover"
    />

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
  import BaseView from './BaseView'
  import {
    ubtSetServoDegree,
    ubtLEDOff,
    ubtLEDOn
  } from '../../utils/ubt'

  export default {
    name: 'designer',

    extends: BaseView,

    components: {
      GenericDialog,
      PeripheralPickerDialog,
    },

    data () {
      return {
        ui: {
          ble: {
            show: false
          }
        },

        ble: {
          connected: false,
          connectedPeripheral: null,
          characteristics: [],
          peripherals: []
        },

        menus: [
          { title: 'LED ON', action: (servo) => { this.turnOnLED(servo) } },
          { title: 'LED OFF', action: (servo) => { this.turnOffLED(servo) } }
        ],

        servos: [
          { index: 0, title: 'SERVO #1', selected: false, color: 'deep-purple', props: { degree: null, duration: null } },
          { index: 1, title: 'SERVO #2', selected: false, color: 'indigo', props: { degree: null, duration: null } },
          { index: 2, title: 'SERVO #3', selected: false, color: 'blue', props: { degree: null, duration: null } },
          { index: 3, title: 'SERVO #4', selected: false, color: 'light-blue', props: { degree: null, duration: null } },
          { index: 4, title: 'SERVO #5', selected: false, color: 'cyan', props: { degree: null, duration: null } },
          { index: 5, title: 'SERVO #6', selected: false, color: 'teal', props: { degree: null, duration: null } },
          { index: 6, title: 'SERVO #7', selected: false, color: 'green', props: { degree: null, duration: null } },
          { index: 7, title: 'SERVO #8', selected: false, color: 'light-green', props: { degree: null, duration: null } },
          { index: 8, title: 'SERVO #9', selected: false, color: 'lime', props: { degree: null, duration: null } },
          { index: 9, title: 'SERVO #10', selected: false, color: 'amber', props: { degree: null, duration: null } },
          { index: 10, title: 'SERVO #11', selected: false, color: 'orange', props: { degree: null, duration: null } },
          { index: 11, title: 'SERVO #12', selected: false, color: 'deep-orange', props: { degree: null, duration: null } },
          { index: 12, title: 'SERVO #13', selected: false, color: 'red', props: { degree: null, duration: null } },
          { index: 13, title: 'SERVO #14', selected: false, color: 'pink', props: { degree: null, duration: null } },
          { index: 14, title: 'SERVO #15', selected: false, color: 'purple', props: { degree: null, duration: null } },
          { index: 15, title: 'SERVO #16', selected: false, color: 'brown', props: { degree: null, duration: null } }
        ]
      }
    },
    methods: {
      open(link) {
        this.$electron.shell.openExternal(link);
      },

      showAddAction () {
        this.showGenericDialog(this.createFields, { action: 'add' }, 'Add Action')
      },

      showSaveDialog () {
        this.showGenericDialog(this.saveFields, { action: 'save' }, 'Save action')
      },

      dialogSave () {
        this.genericDialog.show = false
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

      sendData () {
        // if (!this.ble.connectedPeripheral) {
        //   this.showMessage('Please connect xRobot first!', 'error')
        //   return
        // }

        let notSelected = this.servos.filter(x => !x.selected)
        if (notSelected.length === this.servos.length) {
          this.showMessage('Please select a servo first', 'error')
          return
        }

        let cmd = []
        let selected = this.servos.filter(x => x.selected)
        for (let servo of selected) {
          let frame = ubtSetServoDegree(
            servo.index + 1,
            parseInt(servo.props.degree),
            parseInt(servo.props.duration)
          )
          cmd = cmd.concat(frame)
        }
        console.log(cmd)
      },

      turnOnLED (servo) {
        let cmd = ubtLEDOn(servo.index + 1)
        console.log(cmd)
      },

      turnOffLED (servo) {
        let cmd = ubtLEDOff(servo.index + 1)
        console.log(cmd)
      }
    }
  }
</script>

<style>
  .servo-title {
    line-height: 32px;
  }
</style>
