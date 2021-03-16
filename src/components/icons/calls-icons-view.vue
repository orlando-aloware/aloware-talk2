<template>
  <div class="icons-view">
    <div class="text-center">
      <add-icon/>
      <div class="small text-muted">add</div>
    </div>

    <div class="text-center">
      <answer-icon/>
      <div class="small text-muted">answer</div>
    </div>

    <div class="text-center">
      <decline-icon/>
      <div class="small text-muted">decline</div>
    </div>

    <div class="text-center">
      <drop-icon/>
      <div class="small text-muted">drop</div>
    </div>

    <div class="text-center">
      <drop-on-header-icon />
      <div class="small text-muted">drop on header</div>
    </div>

    <div class="text-center">
      <pause-icon />
      <div class="small text-muted">pause</div>
    </div>
  </div>
</template>

<script>
import AddIcon from './add-icon'
import AnswerIcon from './answer-icon'
import DeclineIcon from './decline-icon'
import DropIcon from './drop-icon'
import DropOnHeaderIcon from './drop-on-header-icon'
import PauseIcon from './pause-icon'

export default {
  components: {
    AddIcon,
    AnswerIcon,
    DeclineIcon,
    DropIcon,
    DropOnHeaderIcon,
    PauseIcon
  }
}
</script>

<style lang="sass" scoped>
.icons-view {
  display:grid;
  grid-template-rows:auto;
  grid-template-columns:auto auto auto auto auto auto auto auto;
  grid-gap: 10px;
}
</style>
