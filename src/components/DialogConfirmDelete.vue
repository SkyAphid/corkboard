<script setup>

import { useDialogConfirmDelete } from './DialogConfirmDeleteUse.js'

//Fetches values: isVisible, message, and resolve (function)
const { isVisible, message, confirmDeletion } = useDialogConfirmDelete()

function confirm() {
  //When resolve is set to true here, it's called back in DialogConfirmDeleteUse.js, which confirms the deletion
  confirmDeletion(true)
  isVisible.value = false
}

function cancel() {
  //When resolve is set to false here, it's called back in DialogConfirmDeleteUse.js, cancelling the deletion
  confirmDeletion(false)
  isVisible.value = false
}

</script>

<template>
  <div v-if="isVisible" class="dialog-overlay">
    <div class="dialog">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path
          fill="#e53e3e"
          d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
        />
      </svg>

      <p v-if="typeof message === 'string'">{{ message }}</p>
      <component :is="message" v-else />

      <div class="actions">
        <button @click="confirm">Confirm</button>
        <button @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>
