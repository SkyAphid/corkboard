/**
VueFlow Dialogue Editor by NOKORI, 2024
Uses the following APIs:
-VueFlow
-VueQuill
-Vue3ContextMenu (https://www.npmjs.com/package/@imengyu/vue3-context-menu)
-UUIDv4
*/

<script setup>
import { ref } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { initialEdges, initialNodes } from './initial-elements.js'

import { useConfirmDeleteDialog } from './components/DialogConfirmDeleteUse.js'
import DialogConfirmDelete from './components/DialogConfirmDelete.vue'

import ResizableNode from './nodes/ResizableNode.vue'
import TextFieldNode from './nodes/TextFieldNode.vue'
import TextAreaNode from './nodes/TextAreaNode.vue'
import NoteNode from './nodes/NoteNode.vue'

import ContextMenu from '@imengyu/vue3-context-menu'

import Icon from './Icon.vue'
import { v4 as uuidv4 } from 'uuid';

const { onInit, onConnect, screenToFlowCoordinate,
  onNodesInitialized, updateNode, addNodes, onNodesChange, applyNodeChanges, onNodeContextMenu,  onNodeDoubleClick, removeNodes,
  addEdges, onEdgeDoubleClick, onEdgesChange, applyEdgeChanges, onEdgeContextMenu, removeEdges,
  onSelectionContextMenu,
  onPaneContextMenu,
  toObject, fromObject } = useVueFlow();

//Edge renaming
const editingEdge = ref(null);

let mouseX = 0;
let mouseY = 0;

onInit((vueFlowInstance) => {
  vueFlowInstance.fitView();
});

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

/* Context Menus */

onNodeDoubleClick((nodeEvent) => {

  let pointerEvent = nodeEvent.event;
  let node = nodeEvent.node;

  pointerEvent.preventDefault();

  ContextMenu.showContextMenu({
    x: pointerEvent.x,
    y: pointerEvent.y,
    items: [
      {
        label: "Delete Node", onClick: () => { removeNodes(node.id) },
      },
    ]
  })

  //console.log(pointerEvent + " " + node.id);

});

onEdgeContextMenu((edgeEvent) => {

let pointerEvent = edgeEvent.event;
let edge = edgeEvent.edge;

//pointerEvent.preventDefault();

pointerEvent.preventDefault();

ContextMenu.showContextMenu({
  x: pointerEvent.x,
  y: pointerEvent.y,
  items: [
    {
      label: "Delete Connection", onClick: () => { removeEdges(edge.id); },
    },
  ]
})

});

onPaneContextMenu((event) => {
  event.preventDefault();

  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    items: [
      {
        label: "Create New...",
        children: [
          { label: "Text Area Node", onClick: () => { createNewNode(event, "text-area"); } },
          { label: "Text Field Node", onClick: () => { createNewNode(event, "text-field"); } },
          { label: "Note", onClick: () => { createNewNode(event, "note"); } },
        ]
      },
    ]
  });

});

onSelectionContextMenu((selectEvent) => {
  selectEvent.event.preventDefault();
});

function createNewNode(event, type) {

  const position = screenToFlowCoordinate({
    x: event.x,
    y: event.y,
  })

  const nodeID = uuidv4();

  const newNode = {
    id: nodeID,
    type,
    position,
    data: { label: "" }
  };

  const { off } = onNodesInitialized(() => {
    updateNode(nodeID, (node) => ({
      position: { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 },
    }))

    off()
  })

  addNodes(newNode);
};

/* Saving & Loading Data */

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

      <ControlButton title="Log `toObject`" @click="console.log(toObject());">
        <Icon name="log" />
      </ControlButton>
    </Controls>

  </VueFlow>

  <!-- Label Renaming Dialog -->
  <div v-if="editingEdge" class="label-renaming-field">
    <input :id="'label-editor'" type="text" v-model="editingEdge.label" @keydown.enter="endEdgeEditing"
      @keydown.escape="endEdgeEditing" />
  </div>

</template>

<style></style>