<script>

export default {
  data () {
    return {
      snackbar: {       // 弹出框
        show: false,
        color: '',
        text: '',
        timeout: 3000
      },
      genericDialog: {
        show: false,
        title: '',
        maxWidth: '400px',
        fields: {},
        userInfo: null
      },
      alert: {
        show: false,
        title: null,
        body: null,
        alertAction: null,
        callback: (confirm) => {
          this.alert.show = false
          if (this.alert.alertAction) {
            this.alert.alertAction(confirm)
          }
        }
      }
    }
  },

  methods: {
    /**
     *  显示消息
     * @param {String} message Message to be shown
     * @param {String} color The color for the snack bar, possible values:
     *                       error/success/info/warning
     * @param {Integer} duration The message shown duration
     */
    showMessage (message, color = '', duration = 3000) {
      this.snackbar.text = message
      this.snackbar.color = color
      this.snackbar.timeout = duration
      this.snackbar.show = true
    },

    /**
     * Show error snack bar
     * @param {String} message The message to be shown
     */
    showError (message) {
      this.showMessage(message, 'error')
    },

    /**
     * Show success snack bar
     * @param {String} message The message to be shown
     */
    showSuccess (message) {
      this.showMessage(message, 'success')
    },

    /**
     * Show info snack bar
     * @param {String} message The message to be shown
     */
    showInfo (message) {
      this.showMessage(message, 'info')
    },

    /**
     * Show warning snack bar
     *
     * @param {String} message The message to be shown
     */
    showWarning (message) {
      this.showMessage(message, 'warning')
    },

    /**
     * Make require rule for form widget
     * @param {String} v The input value
     * @param {String} msg The error message
     */
    ruleRequired (v, msg) {
      const cond = !!v
      return this.makeRule(cond, msg)
    },

    /**
     * Make minimum length validation rule for form widget
     * @param {String} v The input value
     * @param {Integer} min The minimum length for the input value
     * @param {String} msg The error message
     */
    ruleMinLen (v, min, msg) {
      const cond = v && v.length >= min
      return this.makeRule(cond, msg)
    },

    /**
     * Make integer validation rules
     * @param {String} v The input value
     * @param {String} msg The error message
     */
    ruleInteger (v, msg) {
      const cond = /^\d+$/.test(v)
      return this.makeRule(cond, msg)
    },

    /**
     * Make decimal validation rules
     * @param {String} v The input value
     * @param {String} msg The error message
     */
    ruleDecimal (v, msg) {
      const cond = /^(\d{1,}\.\d{1,})$|^(\d+)$/.test(v)
      return this.makeRule(cond, msg)
    },

    /**
     * Make validation rules for form widget
     * @param {boolean} cond  The validation rule condition
     * @param {str} msg The error message
     */
    makeRule (cond, msg) {
      return cond || msg
    },

    /**
     * Show generic edit form
     * @param fields The fields to be shown
     * @type Array
     * @param tag Business tag, this tag will be return from cancel/confirm event
     * @type Object
     * @param title  Title
     * @type String
     * @param {String} maxWidth The dialog width
     */
    showGenericDialog (fields, userInfo = null, title = null, maxWidth = '400px') {
      if (title) {
        this.genericDialog.title = title
      }

      this.genericDialog.fields = fields
      this.genericDialog.show = true
      this.genericDialog.userInfo = userInfo
      this.genericDialog.maxWidth = maxWidth
    },

    /**
     * Show confirm alert dialog
     * @param {String} title The alert title
     * @param {String} body The alert body
     * @param {Function} callback The callback when action button is tapped
     * The `callback` prototype is callback(confirm: Bool)
     */
    showConfirmAlert (title, body, callback) {
      this.alert.title = title
      this.alert.body = body
      this.alert.alertAction = callback
      this.alert.show = true
    }
  }
}
</script>
