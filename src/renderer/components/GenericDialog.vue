<template>
  <v-dialog v-model="show" persistent :max-width="maxWidth">
      <v-card>
        <v-card-title>
          <span class="headline">{{ title }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 v-for="(item, key) in fields" :key="key">
                    <!-- 单选 -->
                    <v-select 
                      v-if="item.type === 'choice' && !item.hide"
                      :items="item.choices"
                      :label="item.label"
                      :required="item.required"
                      v-model="payload[key]"
                    ></v-select>

                    <!-- bool -->
                    <v-checkbox
                      v-else-if="item.type === 'checkbox' && !item.hide"
                      :label="item.label"
                      :required="item.required"
                      v-model="payload[key]"
                    ></v-checkbox>

                    <!-- text -->
                    <v-text-field
                      v-else-if="item.type === 'text' && !item.hide"
                      :required="item.required"
                      :label="item.label"
                      :rules="item.rules"
                      :type="item.textType"
                      v-model="payload[key]"
                    >
                    </v-text-field>

                    <!-- Date picker -->
                    <v-menu
                      v-else-if="item.type === 'date' && !item.hide"
                      v-model="dateShows[key]"
                      :ref="`dateMenu-${key}`"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      :return-value.sync="dateValues[key]"
                    >
                      <v-text-field
                        slot="activator"
                        v-model="payload[key]"
                        :label="item.label"
                        readonly
                      ></v-text-field>
                      <v-date-picker
                        v-model="dateValues[key]"
                        :show-current="payload[key] || true"
                        no-title
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn flat color="red" @click="dateShows[key] = false">Cancel</v-btn>
                        <v-btn flat color="primary" @click="dateConfirm(key, item)">OK</v-btn>
                      </v-date-picker>
                    </v-menu>

                    <!-- Time picker -->
                    <v-menu
                      v-else-if="item.type === 'time' && !item.hide"
                      :ref="`timeMenu-${key}`"
                      v-model="timeShows[key]"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      :return-value.sync="timeValues[key]"
                    >
                      <v-text-field
                        slot="activator"
                        v-model="timeValues[key]"
                        :label="item.label"
                        readonly
                      ></v-text-field>
                      <v-time-picker v-model="timeValues[key]">
                        <v-spacer></v-spacer>
                        <v-btn flat color="red" @click="timeShows[key] = false">Cancel</v-btn>
                        <v-btn flat color="primary" @click="timeConfirm(key, item)">OK</v-btn>
                      </v-time-picker>
                    </v-menu>

                    <!-- Single select -->
                    <v-select
                      v-else-if="item.type === 'choice' && !item.hide"
                      :items="item.choices"
                      :label="item.label"
                      v-model="payload[key]"
                      clearable
                      single-line
                    ></v-select>

                    <!-- Multi select -->
                    <v-select
                      v-else-if="item.type === 'multichoice' && !item.hide"
                      :items="item.choices"
                      :label="item.label"
                      :hint="item.hint"
                      v-model="payload[key]"
                      multiple
                      clearable
                      max-height="400"
                      persistent-hint
                    ></v-select>
                </v-flex>

                <v-flex class="red--text" v-if="error" xs12>{{ error }}</v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click.native="cancelClick">{{ cancel }}</v-btn>
          <v-btn color="blue darken-1" flat @click.native="confirmClick">{{ confirm }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: String,
      default: '400px'
    },
    title: {
      type: String,
      default: ''
    },
    fields: {
      type: Object
    },
    userInfo: {
      type: Object,
      required: false
    },
    cancel: {
      type: String,
      default: 'Cancel'
    },
    confirm: {
      type: String,
      default: 'Confirm'
    },
    validators: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    show: function (val) {
      if (val) {
        this.error = null
        this.payload = {}

        for (let name in this.fields) {
          if (this.fields[name].hide) {
            // Skip the hide items
            continue
          }

          if (this.fields[name].type === 'multichoice') {
            this.payload[name] = this.fields[name].value || []
          } else {
            this.payload[name] = this.fields[name].value
          }

          if (this.fields[name].type === 'date') {
            this.$set(this.dateValues, name, this.fields[name].value)
            this.$set(this.dateShows, name, false)
          }

          if (this.fields[name].type === 'time') {
            this.$set(this.timeValues, name, this.fields[name].value)
            this.$set(this.timeShows, name, false)
          }
        }
      }
    }
  },
  data () {
    return {
      formId: '',
      payload: {},
      dateValues: {},
      timeValues: {},
      dateShows: {},
      timeShows: {},
      error: null
    }
  },
  methods: {
    isFunction (functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    },
    cancelClick () {
      this.$emit('cancel', this.userInfo)
    },
    confirmClick () {
      if (this.$refs.form.validate()) {
        for (let name in this.payload) {
          this.payload[name] = this.payload[name]
        }

        for (let validator of this.validators) {
          if (this.isFunction(validator)) {
            let res = validator(this.payload)
            if (typeof(res) === 'string') {
              this.error = res
              return
            }
          }
        }

        this.$emit('confirm', {userInfo: this.userInfo, payload: this.payload})
      }
    },
    dateConfirm (key) {
      let ref = `dateMenu-${key}`
      this.$refs[ref][0].save(this.dateValues[key])
      this.payload[key] = this.dateValues[key]
    },
    timeConfirm (key) {
      let ref = `timeMenu-${key}`
      this.$refs[ref][0].save(this.timeValues[key])
      this.payload[key] = this.timeValues[key]
    }
  }
}
</script>
