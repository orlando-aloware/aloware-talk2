<template>
  <div>
    <h2 class="mb-1 text-dark">Categories</h2>
    <hr class="my-1">

    <div class="q-my-md"
         v-if="!isEmpty(categories)">
      <q-breadcrumbs class="flex black w-100"
                     active-color="black"
                     :key="summary_index"
                     v-for="(category_summary, summary_index) in categories">
        <template v-slot:separator>
          <q-icon size="1em"
                  name="chevron_right"
                  color="primary"/>
        </template>

        <q-breadcrumbs-el :label="category"
                          :key="category_index"
                          v-for="(category, category_index) in category_summary.categories" />
        <span class="pl-2">
          -<strong class="pl-3">{{ category_summary.relevance }}%</strong>
          <q-tooltip class="float-bottom">
            <span>
              Relevance between the conversation and this category: <strong>{{ category_summary.relevance }}%</strong>
            </span>
          </q-tooltip>
        </span>
      </q-breadcrumbs>
    </div>

    <!-- If no categories were detected. -->
    <div v-else>
      <span>
        We couldn't find any categories in this call. For more information please check
        <a class="link"
           href="https://support.aloware.com/en/articles/9037887-frequently-asked-questions-smart-transcription">
          this article.
        </a>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoriesSection',

  props: {
    categories: {
      type: Array,
      required: true
    },
    isEmpty: {
      type: Function,
      required: true
    }
  }
}
</script>
