<template>
  <div>
    <!-- Entities section. -->
    <h2 class="mt-4 mb-1 text-dark" data-testid="comm-entities-section">Entities</h2>
    <hr class="my-1">
    <!-- Sanity check. -->
    <div v-if="!isEmpty(entities)">
      <!-- We want to show the entities by speaker -->
      <div :key="speaker_index"
           v-for="(speaker, speaker_index) in speakers">
        <!-- Check if an entity was the detected the current speaker -->
        <div class="mt-2"
             v-if="entities[speaker]">
          <div class="speaker--title">{{ speaker }}</div>
          <div :key="type_index"
               v-for="(type, type_index) in entityTypes">
            {{ type | ucfirst }}

            <q-chip class="q-mx-sm q-my-sm q-chip__content white-color"
                    color="green-11"
                    text-color="white"
                    dense
                    :key="entity_index"
                    data-testid="comm-entities-section-chip"
                    v-for="(entity, entity_index) in entities[speaker][type]">
              {{ entity }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- If no entities were detected. -->
    <div v-else-if="!isSimpSocial">
      <span class="mt-3">
        We couldn't find any specific entities in this call. For more information please check
        <a style="color: blue"
           data-testid="comm-entities-section-this-article"
           href="https://support.aloware.com/en/articles/9037887-frequently-asked-questions-smart-transcription">
          this article.
        </a>
      </span>
    </div>
  </div>
</template>

<script>
import { simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'EntitiesSection',

  mixins: [simpsocialMixin],

  props: {
    entities: {
      type: [Object, Array],
      required: true
    },
    speakers: {
      type: Array,
      required: true
    },
    entityTypes: {
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
