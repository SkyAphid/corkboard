/**
Component nodes are designed to hold a label and attributes that can help further describe nodes they're attached to,
and be reused for consistency.
*/
<script setup>
import { ref, watch } from 'vue'
import { NodeResizer } from '@vue-flow/node-resizer'

const componentNodeProps = defineProps(['id', 'data']);

// Initialize attributes as a reactive reference
const attributes = ref(componentNodeProps.data.attributes || []);

// Watch for changes in the attributes and update componentNodeProps
watch(attributes, (newAttrs) => {
  componentNodeProps.data.attributes = newAttrs;
}, { deep: true });

</script>

<template>

  <NodeResizer min-width="200" min-height="50" />

  <!-- Sets up the design of the button-->
  <div class="node-background display: flex">

    <div class="content-wrapper">
      <!-- Label -->
      <input :id="`${id}-text-field`" v-model="componentNodeProps.data.label"
        placeholder="Write component label here..." class="nodrag text-field-node vue-flow__node-value" />

      <!-- Render attributes if available -->
      <div class="attributes-list">
        <div v-for="(attribute, index) in attributes" :key="index" class="attribute-item">
          <input :id="`${id}-attribute-${index}`" v-model="attributes[index]" placeholder="Write attribute here..." class="nodrag text-field-node vue-flow__node-value" />
        </div>
        <!-- Button to add a new attribute -->
        <button @click="attributes.push('')" class="add-attribute-button">Add Attribute</button>
      </div>

      <!-- <span class="tooltiptext">Drag over nodes to add components.</span> -->

    </div>
  </div>

</template>

<style scoped>
.tooltip {
  position: relative;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 0 2px #3367d9;
  border-radius: 10px;
  color: black;
  align-self: center;
  text-align: center;
  padding: 10px 10px;
  bottom: 125%;
  /* Position above the text */
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
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