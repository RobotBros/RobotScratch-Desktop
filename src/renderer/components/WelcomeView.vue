<i18n>
{
  "en": {
    "servoDebugger": "Servo debugger",
    "servoSubtitle": "Single step debug for individual servo",
    "editor": "Motion Editor",
    "editorSubtitle": "Create your own set of montions"
  },
  "zh-CN": {
    "servoDebugger": "舵机调试",
    "servoSubtitle": "单个舵机的角度调试",
    "editor": "动作编辑器",
    "editorSubtitle": "可视化动作编辑器"
  }
}
</i18n>

<template>
  <v-container grid-list-md fluid>
    <!-- Toolbar -->
    <v-layout wrap row>
      <v-flex xs12 sm6 md3 xl2 v-for="(item, i) in cards" :key="i">
        <v-card class="elevation-5">
          <v-card
            @click="navigateTo(item)"
            v-if="item.image"
            :src="item.image"
            height="180px"
            class="pointer"
          ></v-card>
          <v-card
            v-else
            :class="item.image_text_class"
            @click="navigateTo(item)"
            height="180px"
            class="pointer"
          >
            <v-container fill-height fluid justify-center>
              <v-layout fill-height justify-center align-center>
                <v-flex xs12 flexbox class="text-xs-center">
                  <span class="white--text display-2">{{ item.image_text }}</span>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>

          <v-card-title
            class="pointer"
            primary-title
            @click="navigateTo(item)"
          >
            <div>
              <div class="headline mb-2">{{ $t(item.name) }}</div>
              <span class="grey--text">
                {{ $t(item.brief) }}
              </span>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      cards: [
        {
          'name': 'servoDebugger',
          'url': 'servoDebugger',
          'brief': 'servoSubtitle',
          'image': null,
          'image_text': '{ SERVO }',
          'image_text_class': 'blue'
        },
        {
          'name': 'editor',
          'url': 'designer',
          'brief': 'editorSubtitle',
          'image': null,
          'image_text': '{ EDITOR }',
          'image_text_class': 'teal'
        }
      ]
    }
  },

  methods: {
    navigateTo (item) {
      this.$router.push({ name: item.url })
    }
  }
}
</script>

<style>
  .action-icon {
    font-size: 1em;
  }

  .pointer {
    cursor: pointer;
  }
</style>
