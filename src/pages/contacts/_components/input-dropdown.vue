<template>
  <div class="input-dropdown-wrapper">
    <b-input :placeholder="placeholder">

    </b-input>
    <ul class="input-dropdown-menu" style="width:100%">
      <li>Option one</li>
      <li>Option one</li>
      <li>Option one</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'input-dropdown',
  props: {
    placeholder: {
      type: String,
      required: false
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-dropdown-wrapper {
    padding: 5px;
    box-shadow: 0 0 12px -2px rgba(0, 0, 0, 0.08), 0px 12px 18px -4px rgba(4, 4, 4, 0.24);
    border-radius: 8px;
    border: 1px solid black;

    ul.input-dropdown-menu {
      position: relative;
      border: none;
      padding: 0;

      li {
        list-style: none;
        padding: 10px 0 0 12px;
      }
    }
  }

</style>
