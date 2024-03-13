<template>
  <div>
    <!-- Entities section. -->
    <h2 class="mt-4 mb-1 text-dark">Entities</h2>
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
                    v-for="(entity, entity_index) in entities[speaker][type]">
              {{ entity }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- If no entities were detected. -->
    <div v-else>
      <span class="mt-3">
        We couldn't find any specific entities in this call. For more information please check
        <a style="color: blue"
           href="https://support.aloware.com/frequently-asked-questions-smart-transcription-1">
          this article.
        </a>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EntitiesSection',

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
