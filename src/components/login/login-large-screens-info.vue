<template>
  <div class="login-info">
    <div class="default-bg h-100 d-flex justify-content-center align-items-center text-center">
      <div>
        <img src="app-icons/misc/logo_white.svg"
             class="pb-5" />
        <q-carousel
          v-model="slide"
          swipeable
          animated
          infinite
          control-color="green"
          navigation
          padding
          height="480px"
          class="text-white col-12 transparent login-carousel px-0"
          :autoplay="true">
          <q-carousel-slide name="1"
                            class="column no-wrap flex-center">
            <div class="q-mt-md text-center">
              <q-img src="images/login-agent-img1.png"
                     style="max-width: 300px; max-height: 300px;" />
              <strong class="login-slide-heading d-inline-block w-100 pb-2">
                Enterprise call center software,<br>
                built for smart business.
              </strong>
              <span class="w-100 description">
                Supports calls & texts. CRM Integration.<br>
                5 min setup.
              </span>
            </div>
          </q-carousel-slide>
          <q-carousel-slide name="2"
                            class="column no-wrap flex-center">
            <div class="q-mt-md text-center">
              <q-img src="images/login-agent-img2.png"
                     style="max-width: 300px; max-height: 300px;" />
              <strong class="login-slide-heading d-inline-block w-100">
                #1 Phone + SMS/MMS<br>
                Integration For HubSpot
              </strong>
              <span class="w-100">
                Instantly call and text your CRM leads with Aloware's<br>
                outbound sales solution working inside HubSpot
              </span>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login-large-screens-info',

  data () {
    return {
      slide: '1'
    }
  }
}
</script>
