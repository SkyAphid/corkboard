<script setup>
import { ref, watch } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
import { useVueFlow } from '@vue-flow/core'
const { getNodes, getEdges, onEdgesChange } = useVueFlow();

const nodeProps = defineProps(['id', 'data'])

const linkedToNode = ref(false);

//Watch edges for changes, to 
watch(() => nodeProps.data.label, (newLabel) => {
  checkLinks(newLabel);
});

onEdgesChange(() => {
  checkLinks(nodeProps.data.label);
});

function checkLinks(newLabel) {
  linkedToNode.value = false;

  for (const node of getNodes.value) {
    if (node.data.label) {
      //Don't try and match with this node
      if (node.id == nodeProps.id) {
        continue;
      }

      //Compare labels
      if (node.data.label === newLabel) {
        linkedToNode.value = true;
        break;
      }
    }
  }

  let nodeId = nodeProps.id;
  for (const edge of getEdges.value.filter(edge => edge.source === nodeId || edge.target === nodeId)) {
    edge.animated = linkedToNode;
  }

};

</script>

<template>

  <NodeResizer min-width="250" min-height="50" max-height="50" />

  <!-- Sets up the design of the button-->
  <div class="node-background" :class="{ 'jumping-node-border': linkedToNode }">

    <!-- Records the string input from the user and transfer it into the label-->
    <input :id="`${id}-text-field`" v-model="nodeProps.data.label" placeholder="Write target label here..."
      class="nodrag text-field-node vue-flow__node-value" />

    <!-- Configures target/source handles (connectors)-->
    <Handle type="target" :position="Position.Left" :connectable="true" />
  </div>

</template>

<style scoped></style>