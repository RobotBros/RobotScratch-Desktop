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
                  :loading="$store.state.ble.scanning"
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
            <v-icon dark class="mr-1">{{ $store.state.ble.scanning ? 'stop' : 'refresh'}}</v-icon>
            {{ $store.state.ble.scanning ? '停止扫描' : '扫描' }}
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
  import * as types from '@/store/types'
  import underscore from 'underscore'
  import noble from 'noble'

  export default {
    props: {
      show: {
        type: Boolean,
        default: false
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
      message: function () {
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
            this.$store.dispatch(types.BLE_START_SCAN)
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
        ]
      }
    },
    methods: {
      close () {
        if (this.$store.state.ble.scanning) {
          this.$store.dispatch(types.BLE_STOP_SCAN)
        }
        this.$emit('close', {})
      },

      actionTap () {
        if (this.$store.state.ble.scanning) {
          this.$store.dispatch(types.BLE_STOP_SCAN)
        } else {
          this.$store.dispatch(types.BLE_START_SCAN)
        }
      },

      selectPeripheral (peripheral) {
        this.$store.dispatch(types.BLE_STOP_SCAN)
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
      }
    },

    mounted () {
      noble.on('discover', (peripheral) => {
        let index = underscore.find(this.items, x => x.id === peripheral.id)
        if (index === undefined) {
          this.$emit('discover', { peripheral })
        }
      })

      this.$store.dispatch(types.BLE_INIT)
    }
  }
</script>
