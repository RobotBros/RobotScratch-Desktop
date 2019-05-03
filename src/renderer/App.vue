<template>
  <div id="app">
    <v-app dark>
      <v-navigation-drawer
        fixed
        mini-variant
        v-model="drawer"
        app
        dark
        class="grey darken-4"
      >
        <v-list>
          <v-list-tile 
            router
            dark
            :to="item.to"
            :key="i"
            v-for="(item, i) in items"
            active-class="red--text"
            exact
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar flat fixed app :clipped-left="clipped" color="red darken-4">
        <v-toolbar-side-icon @click="drawer =!drawer">
          <v-icon>widgets</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <v-btn
            icon
            slot="activator"
          >
            <v-icon>language</v-icon>
          </v-btn>

          <v-list>
            <v-list-tile
              v-for="(item, i) in rightMenus"
              :key="i"
              @click="item.action(item.lang)"
            >
              <v-list-tile-title>{{ $t(item.title) }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
        <v-btn
          icon
          @click.native.stop="bleDidClick"
        >
          <v-icon>{{ bleIcon }}</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid class="ma-0 pa-0">
          <!-- select BLE -->
          <peripheral-picker-dialog
            :title="$t('designer.selectRobot')"
            :show="ble.show"
            :items="ble.peripherals"
            @close="closePeripheralDialog"
            @discover="discover"
          />

          <!-- snackbar -->
          <v-snackbar
            top
            :timeout="0"
            :color="$store.state.snackbar.color"
            v-model="$store.state.snackbar.show"
          >
            {{ $store.state.snackbar.text }}
            <v-spacer></v-spacer>
            <v-btn flat small @click.native="hideSnack">CLOSE</v-btn>
          </v-snackbar>

          <!-- Modal dialog -->
          <template>
            <v-layout row justify-center>
              <v-dialog v-model="$store.state.alert.show" persistent max-width="400">
                <v-card>
                  <v-card-title class="headline">{{ $store.state.alert.title }}</v-card-title>
                  <v-card-text>{{ $store.state.alert.body }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" flat @click.native="hideAlert(false)">{{ $t('constants.cancel') }}</v-btn>
                    <v-btn color="green darken-1" flat @click.native="hideAlert(true)">{{ $t('constants.confirm') }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-layout>
          </template>

          <v-slide-x-transition mode="out-in">
            <router-view></router-view>
          </v-slide-x-transition>
        </v-container>
      </v-content>
      <v-navigation-drawer
        temporary
        fixed
        :right="right"
        v-model="rightDrawer"
        app
      >
        <v-list>
          <v-list-tile @click.native="right = !right">
            <v-list-tile-action>
              <v-icon light>compare_arrows</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-footer :fixed="fixed" app class="blue-grey darken-4">
        <span class="ml-1">[{{ $t('app.log') }}] {{ logMsg }}</span>
        <v-spacer />
        <span class="mr-1" :class="bleStateColor">{{ bleState }}</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  import PeripheralPickerDialog from '@/components/BLE/PeripheralPickerDialog'
  import { loadLanguageAsync } from '@/setup/i18n-setup'
  import underscore from 'underscore'
  import * as types from '@/store/types'

  const READ_CHARC_UUID = 'ff01'
  const WRITE_CHARAC_UUID = 'ff01'

  export default {
    name: 'RobotScratch',

    components: {
      PeripheralPickerDialog
    },

    data () {
      return {
        ble: {
          show: false,
          connected: false,
          connectedPeripheral: null,
          readCharacteristic: null,
          writeCharacteristic: null,
          peripherals: []
        },
        clipped: false,
        drawer: true,
        fixed: false,
        items: [
          { icon: 'apps', title: 'Welcome', to: '/' },
          { icon: 'settings_remote', title: 'Inspire', to: '/servo-debugger' },
          { icon: 'gamepad', title: 'Designer', to: '/designer' }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'RobotScratch',
        rightMenus: [
          { lang: 'zh-CN', title: 'app.langZhCN', action: this.switchLang },
          { lang: 'en-US', title: 'app.langEN', action: this.switchLang }
        ]
      }
    },

    computed: {
      bleIcon () {
        if (!this.$store.state.ble.connected) {
          return 'bluetooth'
        } else {
          return 'bluetooth_connected'
        }
      },

      bleTip () {
        if (this.$store.state.ble.connected) {
          return this.$t('designer.bleDisconnect')
        } else {
          return this.$t('debugger.connectRobot')
        }
      },

      logMsg () {
        let logs = this.$store.state.logs
        if (logs.length === 0) {
          return
        }

        return logs[logs.length - 1]
      },

      bleState () {
        if (this.ble.connectedPeripheral === null) {
          return this.$t('debugger.bleNotConnect')
        } else {
          return this.$t(
            'debugger.bleConnected',
            {name: underscore.property(['advertisement', 'localName'])(this.ble.connectedPeripheral) || '<no name>'}
          )
        }
      },

      bleStateColor () {
        if (this.ble.connectedPeripheral === null) {
          return 'red--text text--darken-1'
        } else {
          return 'green--text text--darken-1'
        }
      }
    },

    watch: {
      '$store.state.ble.dataToSend': function (data) {
        if (this.ble.writeCharacteristic === null) {
          this.$store.commit(types.LOG_ADD_ENTRY, 'peripheral not connected')
          return
        }

        this.ble.writeCharacteristic.write(data, true, (err) => {
          if (err !== null) {
            this.showError('Failed to send data to xRobot')
          } else {
            this.$store.commit(types.LOG_ADD_ENTRY, 'Data sent')
          }
        })
      }
    },

    methods: {
      switchLang (lang) {
        loadLanguageAsync(lang)
          .catch(err => {
            console.error(err)
          })
      },

      closePeripheralDialog (e) {
        this.ble.show = false
        if (e.peripheral) {
          this.connectPeripheral(e.peripheral)
        }
      },

      connectPeripheral (peripheral) {
        peripheral.connect((err) => {
          if (err) {
            this.$store.commit(types.LOG_ADD_ENTRY, err)
            this.showMessage('Failed to connect peripheral', 'error')
            this.ble.connected = false
            this.ble.connectedPeripheral = null
            this.$store.commit(types.BLE_SET_CONNECTED, false)
            return
          }

          peripheral.discoverAllServicesAndCharacteristics((err, services, characteristics) => {
            if (err) {
              this.$store.commit(types.LOG_ADD_ENTRY, err)
              this.showMessage('Failed to connect peripheral', 'error')
              this.ble.connected = false
              this.ble.connectedPeripheral = null
              this.ble.characteristics = []
              this.$store.commit(types.BLE_SET_CONNECTED, false)
            } else {
              this.ble.connected = true
              this.ble.connectedPeripheral = peripheral
              this.ble.characteristics = characteristics
              for (let ch of characteristics) {
                if (ch.uuid.toLowerCase() === READ_CHARC_UUID) {
                  this.ble.readCharacteristic = ch
                }
                if (ch.uuid.toLowerCase() === WRITE_CHARAC_UUID) {
                  this.ble.writeCharacteristic = ch
                }
              }
              this.$store.commit(types.LOG_ADD_ENTRY, 'Peripheral connected')
              this.$store.commit(types.BLE_SET_CONNECTED, true)

              peripheral.once('disconnect', () => {
                this.ble.connectedPeripheral = null
                this.ble.readCharacteristic = null
                this.ble.writeCharacteristic = null
                this.$store.commit(types.LOG_ADD_ENTRY, 'Peripheral disconnected')
                this.$store.commit(types.BLE_SET_CONNECTED, false)
              })
            }
          })
        })
      },

      discover (e) {
        let peripheral = e.peripheral
        this.ble.peripherals.push(peripheral)
      },

      bleDidClick () {
        if (this.ble.connectedPeripheral) {
          this.$store.commit(types.SHOW_ALERT, 'Warning', 'Are you sure to disconnect xRobot?', confirm => {
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
          this.ble.peripherals = []
          this.ble.show = true
        }
      },

      hideAlert (isConfirm) {
        this.$store.commit(types.HIDE_ALERT, isConfirm)
      },

      hideSnack () {
        this.$store.commit(types.HIDE_SNACK)
      }
    }
  }
</script>

<style>
  /* Global CSS */
</style>
