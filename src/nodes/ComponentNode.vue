/**
Component nodes are designed to hold a label and attributes that can help further describe nodes they're attached to,
and be reused for consistency.
*/
<script setup>
import { ref, watch, onMounted } from 'vue'

const nodeProps = defineProps(['id', 'data']);

// Initialize attributes as a reactive reference
const attributes = ref(nodeProps.data.attributes || []);

// Function to calculate text width dynamically
const calculateTextWidth = (text, font = '2.0em JetBrains Mono') => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
};

// Define refs for input widths and label width
const inputWidths = ref([]);  
const labelWidth = ref(0); // Track label width

const MIN_WIDTH = 250; // Set a minimum width for both label and attribute inputs

// Set default widths on mounted
onMounted(() => {

  // Set initial label width
  labelWidth.value = Math.max(calculateTextWidth(nodeProps.data.label || '') + 20, MIN_WIDTH);
  
  // Set initial widths for attributes
  attributes.value.forEach((attr, index) => {
    inputWidths.value[index] = Math.max(calculateTextWidth(attr) + 20, MIN_WIDTH); // Add some padding
  });
});

// Watch for changes in the attributes, adjust widths, and update componentNodeProps
watch(attributes, (newAttrs) => {
  newAttrs.forEach((attr, index) => {
    inputWidths.value[index] = Math.max(calculateTextWidth(attr) + 20, MIN_WIDTH); // Update width with some padding
  });

  nodeProps.data.attributes = newAttrs;

}, { deep: true });

// Watch changes in label and adjust width
watch(() => nodeProps.data.label, (newLabel) => {
  labelWidth.value = Math.max(calculateTextWidth(newLabel || '') + 20, MIN_WIDTH); // Update label width
});

</script>

<template>
  
  <!-- Sets up the design of the button-->
  <div class="node-background node-border display: flex">
    <div class="content-wrapper">

      <!-- Label -->
      <input :id="`${id}-text-field`" 
             v-model="nodeProps.data.label"
             :style="{ width: `${labelWidth}px` }" 
             placeholder="Write component label here..." 
             class="nodrag text-field-node vue-flow__node-value" />

      <hr class="dashed">

      <!-- Render attributes if available -->
      <div class="attributes-list">
        <div v-for="(attribute, index) in attributes" :key="index" class="attribute-item">
          <input :id="`${id}-attribute-${index}`"
                 v-model="attributes[index]"
                 :style="{ width: `${inputWidths[index]}px` }"
                 placeholder="Write attribute here..." class="nodrag text-field-node vue-flow__node-value" />
        </div>
      </div>

      <!-- Button to add a new attribute -->
      <button @click="attributes.push('')" class="add-attribute-button">Add Attribute</button>

    </div>
  </div>

</template>

<style scoped>

.node-border {
  border: 1px solid #ec4899;
}

hr.dashed {
  border-top: 1px solid #ccc;
  width: 100%;
  margin: 10px 0;
}

/* Add styles for the attributes list and input fields */
.attributes-list {
  margin-top: 10px; /* Space above the attributes list */
}

.attribute-item {
  margin-bottom: 5px;
}

.attribute-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.add-attribute-button {
  margin-top: 15px; /* Space between the attributes list and the button */
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  background-color: #3367d9;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.add-attribute-button:hover {
  background-color: #2a56c6;
}

</style>