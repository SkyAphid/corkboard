<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

const textFieldNodeProps = defineProps(['id', 'data'])

</script>

<template>

<NodeResizer min-width="220" min-height="40" max-height="40"/>

  <!-- Sets up the design of the button-->
  <div class="node-background vue-flow__node-value">
    
    <!-- Records the string input from the user and transfer it into the label-->
    <input :id="`${id}-text-field`" v-model="textFieldNodeProps.data.label" type="text-field" class="nodrag text-field-node" />

    <!-- Configures target/source handles (connectors)-->
    <Handle type="target" :position="Position.Left" :connectable="true" />
    <Handle type="source" :position="Position.Right" :connectable="true" />
  </div>

</template>

<style scope>

</style>