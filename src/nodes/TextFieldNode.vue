<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

const textFieldNodeProps = defineProps(['id', 'data'])

</script>

<template>

<NodeResizer min-width="220" min-height="50" max-height="50"/>

  <!-- Sets up the design of the button-->
  <div class="node-background">
    
    <!-- Records the string input from the user and transfer it into the label-->
    <input :id="`${id}-text-field`" v-model="textFieldNodeProps.data.label" placeholder="Write label here..." class="nodrag text-field-node vue-flow__node-value" />

    <!-- Configures target/source handles (connectors)-->
    <Handle type="target" :position="Position.Left" :connectable="true" />
    <Handle type="source" :position="Position.Right" :connectable="true" />
  </div>

</template>

<style scoped>

</style>