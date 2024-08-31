<script setup>
import { h, ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { initialEdges, initialNodes } from './initial-elements.js'
import { useConfirmDeleteDialog } from './components/DialogConfirmDeleteUse.js'

import ResizableNode from './components/ResizableNode.vue'
import TextFieldNode from './components/TextFieldNode.vue'
import TextAreaNode from './components/TextAreaNode.vue'
import NoteNode from './components/NoteNode.vue'
import DialogConfirmDelete from './components/DialogConfirmDelete.vue'
import Icon from './Icon.vue'

const { onInit, onConnect, addEdges,
  onConnectStart, onConnectEnd,
  onEdgeUpdateStart, onEdgeUpdateEnd, onEdgeClick, onEdgeDoubleClick,
  onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges, updateEdge,
  toObject, fromObject } = useVueFlow();


onInit((vueFlowInstance) => {
  vueFlowInstance.fitView();
});

function logToObject() {
  console.log(toObject());
}

onConnect(addEdges)

//Delete nodes and edges
const deleteKey = 'Delete';
const confirmDeleteDialog = useConfirmDeleteDialog();

onNodesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      //await causes the isConfirmed const to wait on a response from the dialog.confirmDefault function
      const isConfirmed = await confirmDeleteDialog.confirmDefault(change.id)

      if (isConfirmed) {
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  applyNodeChanges(nextChanges)
})

//Edge Renaming
onEdgesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'select') {
      endEdgeEditing();
    }

    if (change.type === 'remove') {
      const isConfirmed = await confirmDeleteDialog.confirmDefault(change.id)

      if (isConfirmed) {
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  applyEdgeChanges(nextChanges)
})

const editingEdge = ref(null);
let mouseX = 0;
let mouseY = 0;

onEdgeDoubleClick(({ mouseEvent, edge }) => {
  editingEdge.value = edge;
  mouseX = edge.sourceX;
  mouseY = edge.sourceY;
  //console.log('edge double clicked', edge, edge.label, mouseX, mouseY);
});

const endEdgeEditing = () => {
  if (editingEdge) {
    editingEdge.value = null;
  }
}

//Saving/Loading
function onSave() {
  const saveData = JSON.stringify(toObject(), null, 2);

  // Create a blob from the JSON string
  const blob = new Blob([saveData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'state.json'; //Name of the downloaded file
  link.click();

  // Clean up
  URL.revokeObjectURL(url);

}

async function onLoad() {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    const file = await fileHandle.getFile();
    const contents = await file.text();
    const loadedState = JSON.parse(contents);
    fromObject(loadedState);
    
  } catch (error) {
    console.error('Failed to open file:', error);
  }
}

</script>


<template>

  <VueFlow :nodes="initialNodes" :edges="initialEdges" :apply-default="false" :delete-key-code=deleteKey
    :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2" :max-zoom="4">

    <!-- Creates Resizable Nodes with the ID 'resizable' (#node- tells us that its a node, the other half is the ID), 
     Then we copy the data required into the properties-->
    <template #node-resizable="resizableNodeProps">
      <ResizableNode :data="resizableNodeProps.data" />
    </template>

    <template #node-text-field="textFieldNodeProps">
      <TextFieldNode :id="textFieldNodeProps.id" :data="textFieldNodeProps.data" />
    </template>

    <template #node-text-area="textAreaNodeProps">
      <TextAreaNode :id="textAreaNodeProps.id" :data="textAreaNodeProps.data" />
    </template>

    <template #node-note="noteNodeProps">
      <NoteNode :id="noteNodeProps.id" :data="noteNodeProps.data" />
    </template>

    <!-- Background & Pattern -->
    <Background pattern-color="#aaa" :gap="16" />

    <DialogConfirmDelete />

    <!-- Toolbar -->
    <Controls position="top-left">
      <ControlButton title="Save" @click="onSave">
        <Icon name="save" />
      </ControlButton>

      <ControlButton title="Load" @click="onLoad">
        <Icon name="restore" />
      </ControlButton>

      <ControlButton title="Log `toObject`" @click="logToObject">
        <Icon name="log" />
      </ControlButton>
    </Controls>

  </VueFlow>

  <div v-if="editingEdge" class="label-renaming-field">
    <input :id="'label-editor'" type="text" v-model="editingEdge.label" @keydown.enter="endEdgeEditing"
      @keydown.escape="endEdgeEditing" />
  </div>

</template>

<style></style>