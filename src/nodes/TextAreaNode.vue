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
      <input :id="`${id}-text-field`" v-model="textAreaNodeProps.data.label"  placeholder="Write label here..." class="nodrag text-field-node vue-flow__node-value" />

      <!-- Rich Text Quill Editor -->
      <QuillEditor :id="`${id}-text-area`" v-model:content="textAreaNodeProps.data.body" contentType="html" placeholder="Write text here..."
      theme="snow" :toolbar="['bold', 'italic', 'underline', 'link', 'code' ]" class="nodrag"/>

      <!-- Configures target/source handles (connectors)-->
      <Handle type="target" :position="Position.Left" :connectable="true" />
      <Handle type="source" :position="Position.Right" :connectable="true" />
      
    </div>

  </div>

</template>

<style scoped>

</style>