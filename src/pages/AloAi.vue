<template>
  <div>
    <upgrade-now-page
      class="mt-5"
      title-text="AloAi"
      image-link="/assets/images/Broadcast.svg"
      text="The leading conversational AI supercharging your path to explosive sales growth. Upgrade today to unlock these features"
      extra-text="Enhance your team’s efficiency and lower operational expenses by automating conversations throughout the entire customer journey.Our AI bot replaces most BDRs and SDRs and will escalate automatically to humans."
      :show-button="false"
    />
  </div>
</template>

<script>
import UpgradeNowPage from 'src/components/upgrade-now-page.vue'

export default {
  name: 'AloAi',

  components: {
    UpgradeNowPage
  }
}
</script>
