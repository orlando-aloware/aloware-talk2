<template>
  <div class="calls-list-item" :class="{'calls-list-item--active': active}" @click="select">
    <div class="calls-list-item__avatar">
      <avatar :src="avatar"
              :active="active">
        {{ initial }}
      </avatar>
    </div>
    <div class="calls-list-item__content">
      <div class="calls-list-item__name">{{ name }}</div>
      <div class="calls-list-item__number">{{ number }}</div>
    </div>
    <div class="calls-list-item__time">
      {{ time }}
    </div>
    <div v-if="active" class="calls-list-item__actions">
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__decline" @click.prevent="decline">
        <pause-icon />
      </a>
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__answer" @click.prevent="answer">
        <drop-icon/>
      </a>
    </div>
    <div v-if="!active" class="calls-list-item__actions">
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__decline" @click.prevent="decline">
        <decline-icon/>
      </a>
      <a href="#" class="calls-list-item__actions__item calls-list-item__actions__answer" @click.prevent="answer">
        <answer-icon/>
      </a>
    </div>
  </div>
</template>

<script>
import DeclineIcon from 'components/icons/decline-icon'
import AnswerIcon from 'components/icons/answer-icon'
import Avatar from 'components/avatar'
import PauseIcon from 'components/icons/pause-icon'
import DropIcon from 'components/icons/drop-icon'

export default {
  name: 'calls-list-item.vue',
  components: { DropIcon, PauseIcon, Avatar, AnswerIcon, DeclineIcon },
  methods: {
    decline () {
      this.$emit('decline')
    },
    answer () {
      this.$emit('answer')
    },
    select () {
      this.$VueEvent.fire('make_call')
    }
  },
  props: {
    initial: {
      type: String,
      default: 'NN'
    },
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: '00:00'
    },
    avatar: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>
