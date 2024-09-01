<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

defineProps(['data'])
</script>

<template>
  <NodeResizer min-width="100" min-height="40" max-width="200"/>

  <div class="node-background">{{ data.label }}
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right"/>
  </div>

</template>

