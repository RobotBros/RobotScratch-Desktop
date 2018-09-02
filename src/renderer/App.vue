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
        <v-toolbar-side-icon>
          <v-icon>widgets</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click.native.stop="rightDrawer = !rightDrawer"
        >
          <v-icon>menu</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid class="ma-0 pa-0">
          <v-slide-y-transition mode="out-in">
            <router-view></router-view>
          </v-slide-y-transition>
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
        <!-- <v-spacer></v-spacer> -->
        <span>&copy; RobotBros &nbsp;</span>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
  export default {
    name: 'RobotScratch',
    data: () => ({
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
    }),
  };
</script>

<style>
  /* Global CSS */
</style>
