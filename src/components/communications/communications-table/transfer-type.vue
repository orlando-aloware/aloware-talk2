<template>
  <div data-testid="transfer-type-row">
    <span v-if="row.transfer_type">
      {{ row.transfer_type | translateTransferTypeText }}
    </span>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>

export default {
  name: 'TransferType',

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
