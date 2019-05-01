import Vue from 'vue'
import Vuex from 'vuex'
import noble from 'noble'
import underscore from 'underscore'
import * as types from '@/store/types'

Vue.use(Vuex)

const MAX_ENTRIES_NUM = 50
const SCAN_INTERVAL = 10000
const SERVICE_UUIDS = ['00ff']
let scanTimer = null

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    logs: [],
    ble: {
      scanning: false,
      state: 'unknown',
      foundDevices: [],
      connected: false,
      connectedPeripheral: null
    }
  },
  mutations: {
    // change ble state
    [types.BLE_UPDATE_STATE]: (state, bleState) => {
      state.ble.state = bleState
    },

    // change scanning status
    [types.BLE_SET_SCANNING]: (state, scanning) => {
      state.ble.scanning = scanning
    },

    // change connected
    [types.BLE_SET_CONNECTED]: (state, connected) => {
      state.ble.connected = connected
    },

    [types.BLE_CLEAR_DEVICES]: (state) => {
      state.ble.foundDevices.length = 0
    },

    // change found device list
    [types.BLE_FOUND_DEVICE]: (state, peripheral) => {
      let index = underscore.find(state.ble.foundDevices, x => x.id === peripheral.id)
      if (index === undefined) {
        state.ble.foundDevices.push(peripheral)
      } else {
        state.ble.foundDevices[index] = peripheral
      }
    },

    // log add entry
    [types.LOG_ADD_ENTRY]: (state, entry) => {
      console.log(entry)
      state.logs.push(entry)
      if (state.logs.length > MAX_ENTRIES_NUM) {
        state.logs = state.logs.slice(1)
      }
    }
  },
  actions: {
    // Setup ble
    [types.BLE_INIT]: (context) => {
      noble.on('stateChange', (state) => {
        context.commit(types.LOG_ADD_ENTRY, `Bluetooth manager state: ${state}`)
        context.commit(types.BLE_UPDATE_STATE, state)
      })

      noble.on('scanStart', () => {
        context.commit(types.BLE_SET_SCANNING, true)
      })

      noble.on('scanStop', () => {
        context.commit(types.BLE_SET_SCANNING, false)
      })

      noble.on('discover', (peripheral) => {
        context.commit(types.BLE_FOUND_DEVICE, peripheral)
      })

      noble.on('warning', (message) => {
        context.commit(types.LOG_ADD_ENTRY, `Bluetooth warning: ${message}`)
      })

      noble.on('disconnect', (peripheralUUID) => {
        context.commit(types.BLE_SET_CONNECTED, false)
      })
    },

    // Start ble scan
    [types.BLE_START_SCAN]: (context) => {
      context.commit(types.BLE_CLEAR_DEVICES)
      context.commit(types.LOG_ADD_ENTRY, 'Start scanning...')
      noble.startScanning(SERVICE_UUIDS, true)
      scanTimer = setTimeout(() => {
        context.dispatch(types.BLE_STOP_SCAN)
      }, SCAN_INTERVAL)
    },

    // Stop ble scan
    [types.BLE_STOP_SCAN]: (context) => {
      if (scanTimer) {
        clearTimeout(scanTimer)
        scanTimer = null
      }
      context.commit(types.LOG_ADD_ENTRY, 'Stop scan')
      noble.stopScanning()
    }
  }
})

export default store
