<template>
  <label for="checker" class="checkbox">
    <input type="checkbox" id="checker" class="checkbox__input"/>
    <div class="checkbox__mark">
      <check-icon/>
    </div>
  </label>
</template>

<script>
import CheckIcon from 'components/icons/check-icon'

export default {
  name: 'checkbox.vue',
  components: { CheckIcon }
}
</script>
