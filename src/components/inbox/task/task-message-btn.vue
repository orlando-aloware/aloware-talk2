<template>
  <button class="task-message-btn">
    <svg width="34px" height="34px" viewBox="0 0 34 34" version="1.1" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink">
      <title>2635CD14-8580-42F7-BA22-D7CC865D562F</title>
      <defs>
        <filter id="filter-1">
          <feColorMatrix in="SourceGraphic" type="matrix"
                         values="0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 0 1.000000 0 0 0 1.000000 0"></feColorMatrix>
        </filter>
        <rect id="path-2" x="0" y="0" width="34" height="34"></rect>
      </defs>
      <g id="Inbox-(with-Dialer-and-Notifications)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Inbox_task_dialer" transform="translate(-871.000000, -595.000000)">
          <g id="icon-/-close-copy-2" transform="translate(644.000000, 75.000000)" filter="url(#filter-1)">
            <g transform="translate(227.000000, 520.000000)" id="chat">
              <mask id="mask-3" fill="white">
                <use xlink:href="#path-2"></use>
              </mask>
              <g id="edit-/-comment-(Background/Mask)"></g>
              <path
                d="M7.08333333,4.25 C5.52074994,4.25 4.25,5.52074994 4.25,7.08333333 L4.25,29.75 L11.0495071,24.6500508 C11.5399584,24.2821893 12.1364972,24.0833333 12.7495751,24.0833333 L26.9166667,24.0833333 C28.4792501,24.0833333 29.75,22.8125834 29.75,21.25 L29.75,7.08333333 C29.75,5.52074994 28.4792501,4.25 26.9166667,4.25 L7.08333333,4.25 Z M11.8059334,21.25 C11.1929426,21.25 10.5964835,21.4487997 10.1060688,21.8165648 L7.08333333,24.0833333 L7.08333333,7.08333333 L26.9166667,7.08333333 L26.9166667,21.25 L11.8059334,21.25 Z"
                id="edit-/-comment" fill="#00BF4A" mask="url(#mask-3)"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  </button>
</template>

<script>
export default {
  name: 'task-message-btn.vue'
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.task-message-btn {
  width: 60px;
  height: 60px;
  background-color: $orange;
  border: none;
  @include border-radius(50%);
  transition: background-color 100ms ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: darken($orange, 7%);
    box-shadow: 0 3px 10px 0 rgba(255,159,28,0.3);
  }
}
</style>
