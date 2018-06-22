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
                  :loading="ui.scanning"
                  :no-data-text="message"
                  hide-actions
                >
                  <template slot="items" slot-scope="props">
                    <td>
                      <v-icon style="width: 24px;" color="grey">bluetooth</v-icon>
                    </td>
                    <td>{{ props.item.address }}</td>
                    <td>{{ $_.property(['advertisement', 'localName'])(props.item) || '&lt;未命名&gt;' }}</td>
                    <td>{{ props.item.rssi }}</td>
                  </template>
                </v-data-table>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            :disabled="state !== 'poweredOn'"
            color="blue lighten-1"
            flat
            @click.native="actionTap"
          >
            <v-icon dark class="mr-1">{{ ui.scanning ? 'stop' : 'refresh'}}</v-icon>
            {{ ui.scanning ? '停止扫描' : '扫描' }}
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
  import noble from 'noble'

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
        default: 10000
      }
    },

    computed: {
      message: function() {
        if (this.state === 'poweredOn') {
          return this.$t('blePicker.noPeripheralFound')
        } else if (this.state === 'poweredOff') {
          return this.$t('blePicker.turnOnBluetooth')
        } else {
          return this.$t('blePicker.notSupport')
        }
      }
    },

    watch: {
      show: function(newVal) {
        if (newVal && this.state === 'poweredOn') {
          // Start scan
          this.startScan()
        } else {
          // Stop if disappear
          this.stopScan()
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
        items: [],
        state: 'unknown',
        ui: {
          scanning: false,
        }
      }
    },
    methods: {
      close () {
        this.$emit('close', this.userInfo)
      },

      actionTap () {
        if (this.ui.scanning) {
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
        this.items = []
        setTimeout(() => {
          this.stopScan()
        }, this.interval)
      },

      /**
       * Stop scan
       */
      stopScan() {
        console.log('Stop scan')
        noble.stopScanning()
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
      }
    },
    mounted () {
      noble.on('stateChange', (state) => {
        console.log(`Bluetooth manager state: ${state}`)
        this.state = state
      })

      noble.on('scanStart', () => {
        this.ui.scanning = true
      })

      noble.on('scanStop', () => {
        this.ui.scanning = false
      })

      let self = this
      noble.on('discover', (peripheral) => {
        console.log(peripheral)
        let index = self.$_.findIndex(self.items, x => x.id == peripheral.id)
        if (index != -1) {
          self.items.splice(index, 1)
        }
        self.items.push(peripheral)
      })
    }
  }
</script>
