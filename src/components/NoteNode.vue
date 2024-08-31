<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

const noteNodeProps = defineProps(['id', 'data'])

</script>

<template>

  <NodeResizer min-width="250" min-height="250" />

  <!-- Sets up the design of the button-->
  <div class="node-background">

    <div class="content-wrapper">

      <!-- Rich Text Quill Editor -->
      <QuillEditor :id="`${id}-note-area`" v-model:content="noteNodeProps.data.body" contentType="html" placeholder="Write note here..."
       theme="snow" :toolbar="['bold', 'italic', 'underline', 'link', 'code']" class="nodrag"/>

    </div>

  </div>

</template>

<style scoped>
.node-background {
  /* Ensure the node resizer respects the size of this div */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* Adds space between the input and QuillEditor */
  height: 100%;
}

.quill-editor {
  /* Ensure the Quill editor does not exceed the parent size */
  max-width: 100%;
  max-height: 100%;
  flex-grow: 1;
  /* Allow the editor to grow within the available space */
  overflow: hidden;
  box-sizing: border-box;
}
</style>