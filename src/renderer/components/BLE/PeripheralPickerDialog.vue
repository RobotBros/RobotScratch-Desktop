<template>
  <v-dialog v-model="show" persistent :max-width="maxWidth">
      <v-card>
        <v-card-title>
          <span class="headline">{{ title }}</span>
        </v-card-title>
        <v-card-text class="px-0">
          <v-container grid-list-md class="px-0 pb-0">
            <v-layout wrap>
              <v-flex xs12>
                <v-data-table
                  :headers="headers"
                  :items="items"
                  :loading="scanning"
                  :no-data-text="message"
                  hide-actions
                >
                  <template slot="items" slot-scope="props">
                    <tr @click="selectPeripheral(props.item)">
                      <td>
                        <v-icon style="width: 24px;" color="grey">bluetooth</v-icon>
                      </td>
                      <td>{{ props.item.address }}</td>
                      <td>{{ $_.property(['advertisement', 'localName'])(props.item) || '&lt;未命名&gt;' }}</td>
                      <td>{{ props.item.rssi }}</td>
                    </tr>
                  </template>
                </v-data-table>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            :disabled="$store.state.ble.state !== 'poweredOn'"
            color="blue lighten-1"
            flat
            @click.native="actionTap"
          >
            <v-icon dark class="mr-1">{{ scanning ? 'stop' : 'refresh'}}</v-icon>
            {{ scanning ? '停止扫描' : '扫描' }}
          </v-btn>
          <v-btn color="red lighten-1" flat @click.native="close">
            <v-icon dark class="mr-1">close</v-icon>
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
  import * as types from '@/renderer/store/types'
  import noble from 'noble'
  import underscore from 'underscore'

  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      maxWidth: {
        type: String,
        default: '600px'
      },
      title: {
        type: String,
        default: ''
      },
      uuids: {
        type: Array,
        default: () => []
      },
      interval: {
        type: Number,
        default: 3000
      },
      items: {
        type: Array,
        default: () => []
      }
    },

    computed: {
      message: function() {
        let state = this.$store.state.ble.state
        if (state === 'poweredOn') {
          return this.$t('blePicker.noPeripheralFound')
        } else if (state === 'poweredOff') {
          return this.$t('blePicker.turnOnBluetooth')
        } else {
          return this.$t('blePicker.notSupport')
        }
      }
    },

    watch: {
      show: function (newVal) {
        if (newVal) {
          if (this.$store.state.ble.state === 'poweredOn') {
            // Start scan
            this.startScan()
          }
        }
      }
    },

    data () {
      return {
        headers: [
          { text: ' ', value: 'signal', sortable: false },
          { text: 'MAC', align: 'left', sortable: false, value: 'mac' },
          { text: 'Name', value: 'name', sortable: false },
          { text: 'RSSI', value: 'rssi', sortable: false }
        ],
        scanning: false
      }
    },
    methods: {
      close () {
        if (this.scanning) {
          this.stopScan()
        }
        this.$emit('close', {})
      },

      actionTap () {
        if (this.scanning) {
          this.stopScan()
        } else {
          this.startScan()
        }
      },

      /**
       * Start scan
       */
      startScan() {
        console.log('Start scanning...')
        noble.startScanning(this.uuids, true)
        setTimeout(() => {
          noble.stopScanning()
        }, this.interval)
      },

      /**
       * Stop scan
       */
      stopScan() {
        console.log('Stop scan')
        noble.stopScanning()
      },

      selectPeripheral (peripheral) {
        this.$emit('close', {peripheral: peripheral})
      },

      /**
       * Convert RSSI value to signal icon
       * 
       * @param {Number} rssi  The signal db value
       * @returns The signal icon
       */
      rssiIcon (rssi) {
        console.log(rssi)
        if (rssi < -100) {
          return 'signal_cellular_0_bar'
        } else if (rssi < -85) {
          return 'signal_cellular_1_bar'
        } else if (rssi < -70) {
          return 'signal_cellular_2_bar'
        } else {
          return 'signal_cellular_3_bar'
        }
      },

      setup () {
        noble.on('stateChange', (state) => {
          console.log(`Bluetooth manager state: ${state}`)
          this.$store.commit(types.BLE_UPDATE_STATE, state)
        })

        noble.on('scanStart', () => {
          this.scanning = true
        })

        noble.on('scanStop', () => {
          this.scanning = false
        })

        noble.on('discover', (peripheral) => {
          let index = underscore.find(this.items, x => x.id === peripheral.id)
          if (index === undefined) {
            this.$emit('discover', {peripheral: peripheral})
          }
        })
      }
    },
    mounted () {
      this.setup()
    }
  }
</script>
