<script setup>

const isVisible = ref(false);

function confirm() {
  isVisible = false
}

function cancel() {
  isVisible = false
}

</script>

<template>
  <div v-if="isVisible" class="dialog-overlay">
    <div class="dialog">

      <p><h1>Edit edge label:</h1></p>
      <input :id="`${id}-input`" v-model="string" type="text-field" class="nodrag text-field-node" />

      <div class="actions">
        <button @click="confirm">Confirm</button>
        <button @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>
