import qs from 'qs'

export default {
  data () {
    return {
      isLoading: false,
      filterParams: {
        'page': 1,
        'per_page': 25,
        'filter_groups[0][filters][contact_lists][value][0]': 18,
        'filter_groups[0][filters][contact_lists][operator]': 1,
        'filter_groups[0][is_conjunction]': true,
        'order': 'desc'
      }
    }
  },
  methods: {},
  computed: {
    async processFetch (params) {
      return this.$axios
        .get('api/v2/contacts', {
          params: params,
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          console.log('data from api : ', data)
          this.contactsLoaded({
            id: this.id || '',
            append: false,
            ...data
          })
        })
    },
    columns () {
      let headers = []
      return headers
    }
  }
}
