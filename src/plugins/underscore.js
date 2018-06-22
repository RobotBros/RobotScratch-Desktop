import underscore from 'underscore'

export default {
  install: function (Vue) {
    Vue.prototype.$_ = underscore
  }
}

export const _ = underscore
