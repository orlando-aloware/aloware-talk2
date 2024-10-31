<template>
  <div class="container-signal-strength">
    <ul class="network-signal-strength">
      <li class="very-weak">
        <div id="very-weak"
             :style="signalStrength >= 1 ? { backgroundColor: color } : {}">
        </div>
      </li>
      <li class="weak">
        <div id="weak"
             :style="signalStrength >= 2 ? { backgroundColor: color } : {}">
        </div>
      </li>
      <li class="strong">
        <div id="strong"
             :style="signalStrength >= 3 ? { backgroundColor: color } : {}">
        </div>
      </li>
      <li class="pretty-strong">
        <div id="pretty-strong"
             :style="signalStrength === 4 ? { backgroundColor: color } : {}">
        </div>
      </li>
    </ul>
    {{ issue.description }}
  </div>
</template>
<script>
export default {
  name: 'network-signal-strength',

  props: {
    issue: {
      required: true
    },
    valueIssue: {
      required: true
    }
  },

  data () {
    return {
      signalStrength: 0,
      color: '',
      colors: ['#E53246', '#EBC962', '#256EFF', '#828282']
    }
  },

  mounted () {
    for (const [index, range] of this.issue.bucketing.entries()) {
      if (range.max >= this.valueIssue && this.valueIssue >= range.min) {
        this.color = this.colors[index]
        this.signalStrength = index + 1
        break
      }
    }
  }
}
</script>

<style scoped>
.network-signal-strength {
  height: 20px;
  list-style: none;
  padding: 0;
  margin: 0 5px 0 0;

  & li {
    width: 6px;
    float: left;
    height: 100%;
  }

  & li.pretty-strong {
    padding-top: 0px;
  }

  & li.strong {
    padding-top: 4px;
  }

  & li.weak {
    padding-top: 8px;
  }

  & li.very-weak {
    padding-top: 12px;
  }

  & li div {
    height: 100%;
    border: 1px solid white;
    background: #828282;
  }
}

.container-signal-strength {
  display: flex;
  padding: 0.5rem 0;
}
</style>
