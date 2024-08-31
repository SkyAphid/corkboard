<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'

const textFieldNodeProps = defineProps(['id', 'data'])

</script>

<template>

<NodeResizer min-width="220" min-height="50" max-height="50"/>

  <!-- Sets up the design of the button-->
  <div class="node-background vue-flow__node-value">
    
    <!-- Records the string input from the user and transfer it into the label-->
    <input :id="`${id}-text-field`" v-model="textFieldNodeProps.data.label" type="text-field" placeholder="Write label here..." 
      class="nodrag text-field-node vue-flow__node-value" />

    <!-- Configures target/source handles (connectors)-->
    <Handle type="target" :position="Position.Left" :connectable="true" />
    <Handle type="source" :position="Position.Right" :connectable="true" />
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
</style>