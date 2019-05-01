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
          @click.native.stop="rightDrawer = !rightDrawer"
        >
          <v-icon>menu</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid class="ma-0 pa-0">
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
      <v-footer :fixed="fixed" app class="grey darken-4">
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  import { loadLanguageAsync } from '@/setup/i18n-setup'

  export default {
    name: 'RobotScratch',

    data () {
      return {
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
          { lang: 'en-GB', title: 'app.langEN', action: this.switchLang }
        ]
      }
    },

    methods: {
      switchLang (lang) {
        loadLanguageAsync(lang)
          .catch(err => {
            console.error(err)
          })
      }
    }
  }
</script>

<style>
  /* Global CSS */
</style>
