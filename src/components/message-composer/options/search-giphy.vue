<template>
  <div class="giphy-wrapper">
    <div>
      <q-input dense
               outlined
               v-model="search_text"
               placeholder="Search"
               data-testid="search-giphy-input"
               @input="findGif">
        <template v-slot:append>
          <q-avatar data-testid="search-giphy-avatar">
            <search-icon data-testid="search-giphy-icon"/>
          </q-avatar>
        </template>
      </q-input>
    </div>
    <div class="mt-3">
      <vue-masonry-gallery v-if="gifs_arr.length > 0"
                           :imgsArr="gifs_arr"
                           :width="418"
                           :height="292"
                           :img-width="100"
                           data-testid="search-giphy-gallery"
                           @scrollReachBottom="loadMoreGiphy"
                           @click="selected">
      </vue-masonry-gallery>
    </div>
  </div>
</template>

<script>
import GiphyClient from 'giphy-js-sdk-core'
import _ from 'lodash'
import SearchIcon from 'components/icons/search-icon'

export default {
  name: 'search-giphy',
  components: { SearchIcon },
  data () {
    return {
      client: GiphyClient(process.env.GIPHY_API_KEY),
      gifs_loading: false,
      search_text: null,
      gifs_arr: [],
      page: 0,
      total_pages: 0,
      per_page: 25,
      total_trending_pages: 0,
      trending_page: 0,
      search_type: 'trending'
    }
  },
  methods: {
    init () {
      this.reset()
      this.search_type = 'trending'
      this.trendingGiphy()
    },
    reset () {
      this.gifs_arr = []
      this.page = 0
      this.total_pages = 0
      this.trending_page = 0
      this.total_trending_pages = 0
    },
    searchGiphy () {
      if (!this.search_text && this.search_type === 'custom') {
        this.init()
        return
      }

      this.gifs_loading = true
      this.client.search('gifs', {
        q: this.search_text,
        offset: this.page * this.per_page,
        limit: this.per_page
      }).then((res) => {
        this.gifs_loading = false
        this.total_pages = res.pagination.count
        this.addGifs(res.data)
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },
    trendingGiphy () {
      this.gifs_loading = true
      this.client.trending('gifs', {
        offset: this.trending_page * this.per_page,
        limit: this.per_page
      }).then((res) => {
        this.gifs_loading = false
        this.total_trending_pages = res.pagination.count
        this.addGifs(res.data)
        //
      }).catch((err) => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },
    loadMoreGiphy () {
      if (this.search_type === 'custom' && this.page < this.total_pages) {
        this.page++
        this.searchGiphy()
      }

      if (this.search_type === 'trending' && this.trending_page < this.total_trending_pages) {
        this.trending_page++
        this.trendingGiphy()
      }
    },
    addGifs (gifs) {
      if (!gifs || gifs.length === 0) {
        this.reset()
        return
      }

      const newGifs = gifs.map((gif) => ({
        src: gif.images.downsized.url
      }))

      const gif = { data: null }
      for (gif.data of newGifs) {
        this.gifs_arr.push(gif.data)
      }
    },
    findGif: _.debounce(function () {
      this.reset()
      this.search_type = 'custom'
      this.searchGiphy()
    }, 500),

    selected (event, target) {
      this.$emit('selected', target.value.src)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style lang="scss" scoped>
  .giphy-wrapper {
    height: 352px;
    width: 420px;
  }
</style>
