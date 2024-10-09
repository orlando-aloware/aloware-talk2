<template>
  <div>
    <upgrade-now-page
      class="mt-5"
      title-text="AloAi Tools"
      image-link="/assets/images/Broadcast.svg"
      text="Boost your productivity with Aloware’s powerful AI tools!"
      extra-text="Automate calls with Voice AI, handle more conversations through Text Bot AI, and gain valuable insights with Voice AI Analytics. These tools free up your time by managing routine tasks and providing real-time data to improve your performance."
      extra-text2="Want to deliver faster responses and see how you’re doing? Ask your admin to unlock the AloAi tools today and take your work to the next level!"
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
