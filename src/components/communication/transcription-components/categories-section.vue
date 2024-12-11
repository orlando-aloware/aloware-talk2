<template>
  <div class="mb-4"
       v-if="!isEmpty(categories)">
    <h2 class="mb-1 text-dark" data-testid="comm-categories-section-h2">Categories</h2>
    <hr class="my-1">

    <div class="q-my-md">
      <q-breadcrumbs class="flex black w-100"
                     active-color="black"
                     gutter="none"
                     :key="summary_index"
                     data-testid="comm-categories-section-breadcrumbs"
                     v-for="(category_summary, summary_index) in categories">
        <template v-slot:separator>
          <q-icon size="1em"
                  name="chevron_right"
                  color="primary"/>
        </template>

        <q-breadcrumbs-el :label="category"
                          :key="category_index"
                          data-testid="comm-categories-section-breadcrumbs-el"
                          v-for="(category, category_index) in category_summary.categories" />
        <span class="pl-2">
          -<strong class="pl-2">{{ category_summary.relevance }}%</strong>
          <q-tooltip class="float-bottom">
            <span>
              Relevance between the conversation and this category: <strong>{{ category_summary.relevance }}%</strong>
            </span>
          </q-tooltip>
        </span>
      </q-breadcrumbs>
    </div>
  </div>
</template>

<script>
import { simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'CategoriesSection',

  mixins: [simpsocialMixin],

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
