<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

const textAreaNodeProps = defineProps(['id', 'data'])

</script>

<template>

<NodeResizer min-width="250" min-height="150"/>

  <!-- Sets up the design of the button-->
  <div class="node-background vue-flow__node-value">
    
    <!-- Records the string input from the user and transfer it into the label-->
    
    <input :id="`${id}-text-area`" v-model="textAreaNodeProps.data.label" type="text-area" class="nodrag text-field-node" />

    <!-- Configures target/source handles (connectors)-->
    <Handle type="target" :position="Position.Left" :connectable="true" />
    <Handle type="source" :position="Position.Right" :connectable="true" />
  </div>

</template>

<style scope>

</style>