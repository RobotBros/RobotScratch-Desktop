<i18n>
{
  "en": {
    "selectServoFirst": "Please select a servo first",
    "targetDegree": "Target degree (n˚)",
    "duration": "Duration (ms)",
    "connectRobot": "Connect xRobot",
    "bleNotConnect": "Bluetooth not connect",
    "bleConnected": "Bluetooth connected: %{name}",
    "send": "Send"
  },
  "zh-CN": {
    "selectServoFirst": "请先选择舵机",
    "targetDegree": "目标角度 (n˚)",
    "duration": "运行时间 (ms)",
    "connectRobot": "连接xRobot",
    "bleNotConnect": "Bluetooth not connect",
    "bleConnected": "Bluetooth connected: %{name}",
    "send": "发送"
  }
}
</i18n>
<template>
  <v-container grid-list-md fluid class="pa-0 ma-0">
    <!-- Toolbar -->
    <v-layout row>
      <v-flex xs12>
        <v-toolbar color="grey darken-4" dense flat class="mb-2">
          <!-- Send data -->
          <v-tooltip bottom>
            <v-btn slot="activator" icon @click="sendData">
              <v-icon>send</v-icon>
            </v-btn>
            <span>{{ $t('send') }}</span>
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
                  class="mt-0"
                  v-model="servo.selected"
                  color="white"
                  hide-details
                ></v-switch>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text>
            <v-text-field
              solo-inverted
              hide-details
              prepend-icon="rotate_right"
              append-icon="˚"
              type="number"
              v-model="servo.props.degree"
              :label="$t('targetDegree')"
            />

            <v-text-field
              hide-details
              solo-inverted
              prepend-icon="timer"
              append-icon="''"
              type="number"
              v-model="servo.props.duration"
              :label="$t('duration')"
            />

            <v-slider
              prepend-icon="rotate_right"
              :min="servo.min"
              :max="servo.max"
              :color="servo.color"
              v-model="servo.props.degree"
              @change="sendData"
              @start="servo.selected = true"
            ></v-slider>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import GenericDialog from './GenericDialog'
  import * as types from '@/store/types'
  import BaseView from './BaseView'
  import {
    ubtSetServoDegree,
    ubtLEDOff,
    ubtLEDOn
  } from '@/utils/ubt'
  import * as binutil from '@/utils/binutil'

  export default {
    name: 'designer',

    extends: BaseView,

    components: {
      GenericDialog
    },

    data () {
      return {
        menus: [
          { title: 'LED ON', action: (servo) => { this.turnOnLED(servo) } },
          { title: 'LED OFF', action: (servo) => { this.turnOffLED(servo) } }
        ],

        servos: [
          { index: 0, title: 'SERVO #1', min: 0, max: 360, selected: false, color: 'deep-purple', props: { degree: null, duration: null } },
          { index: 1, title: 'SERVO #2', min: 0, max: 360, selected: false, color: 'indigo', props: { degree: null, duration: null } },
          { index: 2, title: 'SERVO #3', min: 0, max: 360, selected: false, color: 'blue', props: { degree: null, duration: null } },
          { index: 3, title: 'SERVO #4', min: 0, max: 360, selected: false, color: 'light-blue', props: { degree: null, duration: null } },
          { index: 4, title: 'SERVO #5', min: 0, max: 360, selected: false, color: 'cyan', props: { degree: null, duration: null } },
          { index: 5, title: 'SERVO #6', min: 0, max: 360, selected: false, color: 'teal', props: { degree: null, duration: null } },
          { index: 6, title: 'SERVO #7', min: 0, max: 360, selected: false, color: 'green', props: { degree: null, duration: null } },
          { index: 7, title: 'SERVO #8', min: 0, max: 360, selected: false, color: 'light-green', props: { degree: null, duration: null } },
          { index: 8, title: 'SERVO #9', min: 0, max: 360, selected: false, color: 'lime', props: { degree: null, duration: null } },
          { index: 9, title: 'SERVO #10', min: 0, max: 360, selected: false, color: 'amber', props: { degree: null, duration: null } },
          { index: 10, title: 'SERVO #11', min: 0, max: 360, selected: false, color: 'orange', props: { degree: null, duration: null } },
          { index: 11, title: 'SERVO #12', min: 0, max: 360, selected: false, color: 'deep-orange', props: { degree: null, duration: null } },
          { index: 12, title: 'SERVO #13', min: 0, max: 360, selected: false, color: 'red', props: { degree: null, duration: null } },
          { index: 13, title: 'SERVO #14', min: 0, max: 360, selected: false, color: 'pink', props: { degree: null, duration: null } },
          { index: 14, title: 'SERVO #15', min: 0, max: 360, selected: false, color: 'purple', props: { degree: null, duration: null } },
          { index: 15, title: 'SERVO #16', min: 0, max: 360, selected: false, color: 'brown', props: { degree: null, duration: null } }
        ]
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
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

      sendData () {
        if (!this.$store.state.ble.connected) {
          this.showMessage('Please connect xRobot first!', 'error')
          return
        }

        let notSelected = this.servos.filter(x => !x.selected)
        if (notSelected.length === this.servos.length) {
          this.showMessage(this.$t('selectServoFirst'), 'error')
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
        cmd = binutil.buildFrame(binutil.FrameCmdUBT, cmd)
        this.$store.commit(types.LOG_ADD_ENTRY, binutil.toHexString(cmd))
        this.$store.commit(types.BLE_SEND_DATA, cmd)
      },

      turnOnLED (servo) {
        let cmd = ubtLEDOn(servo.index + 1)
        cmd = binutil.buildFrame(binutil.FrameCmdUBT, cmd)
        this.$store.commit(types.LOG_ADD_ENTRY, binutil.toHexString(cmd))
        this.$store.commit(types.BLE_SEND_DATA, cmd)
      },

      turnOffLED (servo) {
        let cmd = ubtLEDOff(servo.index + 1)
        cmd = binutil.buildFrame(binutil.FrameCmdUBT, cmd)
        this.$store.commit(types.LOG_ADD_ENTRY, binutil.toHexString(cmd))
        this.$store.commit(types.BLE_SEND_DATA, cmd)
      },

      changeDegree (e) {
        this.sendData()
      }
    }
  }
</script>

<style>
  .servo-title {
    line-height: 32px;
  }
</style>
