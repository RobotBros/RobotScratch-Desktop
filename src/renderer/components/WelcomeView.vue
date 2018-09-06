<template>
  <v-container grid-list-md fluid>
    <!-- Toolbar -->
    <v-layout wrap row>
      <v-flex xs12 sm6 md3 xl2 v-for="(item, i) in cards" :key="i">
        <v-card class="elevation-5">
          <v-card-media
            @click="navigateTo(item)"
            v-if="item.image"
            :src="item.image"
            height="180px"
            class="pointer"
          ></v-card-media>
          <v-card-media
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
          </v-card-media>

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
          "name": "welcome.servoDebugger",
          "url": "servoDebugger",
          "brief": "welcome.servoSubtitle",
          "image": null,
          "image_text": "{ SERVO }",
          "image_text_class": "blue"
        },
        {
          "name": "welcome.editor",
          "url": "designer",
          "brief": "welcome.editorSubtitle",
          "image": null,
          "image_text": "{ EDITOR }",
          "image_text_class": "teal"
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
