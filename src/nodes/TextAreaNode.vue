<script setup>
import { ref, watch, onMounted } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer';

// Setup properties
const nodeProps = defineProps(['id', 'data']);

// Initialize components as a reactive reference
const components = ref(nodeProps.data.components || []);

// Initialize componentNodes as a reactive reference
const componentNodes = ref([]);

// Use VueFlow
const { findNode } = useVueFlow();

// Watch for changes in components
watch(components, (newComponents) => {
  componentNodes.value = [];

  if (newComponents != null) {
    for (let i = 0; i < newComponents.length; i++) {
      const component = newComponents[i];

      if (component == null) {
        continue;
      }

      const node = findNode(component);

      if (node != null) {
        componentNodes.value.push(node);
      }
    }
  }
}, { deep: true });

//Watch this node's data and push changes to the undoStack, and also watch for changes in components
watch(() => nodeProps.data.components, (newComponents) => {
  components.value = newComponents || [];
}, { deep: true });

//Re-connect components on load
onMounted(() => {

  if (nodeProps.data.components) {
    for (const component of nodeProps.data.components) {
      const node = findNode(component);
      componentNodes.value.push(node);
    }
  }

});

</script>

<template>

  <NodeResizer min-width="300" min-height="300" />

  <!-- Sets up the design of the button-->
  <div class="node-background" :class="{ 'starting-node-border': nodeProps.data.isStartingNode }">

    <div class="content-wrapper">

      <!--Label field-->
      <input :id="`${id}-text-field`" v-model="nodeProps.data.label" placeholder="Write label here..."
        class="nodrag text-field-node vue-flow__node-value" />

      <!-- Rich Text Quill Editor -->
      <QuillEditor :id="`${id}-text-area`" v-model:content="nodeProps.data.body" contentType="html"
        placeholder="Write text here..." theme="snow" :toolbar="['bold', 'italic', 'underline', 'link', 'code']"
        class="nodrag" />

      <!-- Render components if available -->
      <div v-if="componentNodes && componentNodes.length > 0" class="components-list">
        <div v-for="(component, index) in componentNodes" :key="index" class="component-item">
          <label :for="`${id}-component-${index}`">{{ component.data.label ? component.data.label : component.id
            }}</label>
        </div>
      </div>

      <!-- Configures target/source handles (connectors)-->
      <Handle type="target" :position="Position.Left" :connectable="true" />
      <Handle type="source" :position="Position.Right" :connectable="true" />

    </div>

  </div>

</template>


<style scoped>
.intersecting {
  background: #f15a16
}

/* Add styles for the components list and input fields */
.components-list {
  margin-top: 10px;
}

.component-item {
  margin-bottom: 5px;
}

.component-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

</style>