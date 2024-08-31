<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

const textAreaNodeProps = defineProps(['id', 'data'])

</script>

<template>

  <NodeResizer min-width="250" min-height="200" />

  <!-- Sets up the design of the button-->
  <div class="node-background">

    <div class="content-wrapper">

      <!--Label field-->
      <input :id="`${id}-text-field`" v-model="textAreaNodeProps.data.label" type="text-area" placeholder="Write label here..." class="nodrag text-field-node vue-flow__node-value" />

      <!-- Rich Text Quill Editor -->
      <QuillEditor :id="`${id}-text-area`" v-model:content="textAreaNodeProps.data.body" contentType="html" placeholder="Write text here..."
      theme="snow" :toolbar="['bold', 'italic', 'underline', 'link', 'code']" class="nodrag"/>

      <!-- Configures target/source handles (connectors)-->
      <Handle type="target" :position="Position.Left" :connectable="true" />
      <Handle type="source" :position="Position.Right" :connectable="true" />
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

input {
  /* Make sure the input field doesn't grow too large */
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid #ccc; /* Default border color */
  border-radius: 5px; /* Optional: Rounded corners */
  transition: border-color 0.3s ease-in-out; /* Smooth transition */
}

/* Change the outline color when the input is focused */
input:focus {
  outline: none; /* Remove default outline */
  border-color: #ec4899; /* Set custom outline color */
  box-shadow: 0 0 0 1px rgba(236, 72, 153, 1); /* Optional: Add a shadow effect */
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