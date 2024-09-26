/**
Corkboard Dialogue/Node-based Editor by NOKORIWARE, 2024
Uses the following APIs:
-VueFlow
-VueQuill
-Vue3ContextMenu (https://www.npmjs.com/package/@imengyu/vue3-context-menu)
-UUIDv4
*/

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, provide } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { initialEdges, initialNodes } from './initial-elements.js'

import TextFieldNode from './nodes/TextFieldNode.vue'
import TextAreaNode from './nodes/TextAreaNode.vue'
import ComponentNode from './nodes/ComponentNode.vue'
import JumperNode from './nodes/JumperNode.vue'
import NoteNode from './nodes/NoteNode.vue'

import { useComponentUtil } from './nodes/ComponentUtil.js'

import ContextMenu from '@imengyu/vue3-context-menu'

import Icon from './Icon.vue'
import { v4 as uuidv4 } from 'uuid';

const { onInit, screenToFlowCoordinate,
  onConnect, onNodesInitialized, onNodeDrag, updateNode, findNode,
  isNodeIntersecting, getIntersectingNodes,
  addNodes, onNodeDoubleClick, onNodesChange, applyNodeChanges, onNodeContextMenu, removeNodes,
  addEdges, onEdgeDoubleClick, onEdgesChange, applyEdgeChanges, onEdgeContextMenu, removeEdges,
  onSelectionContextMenu,
  onPaneContextMenu,
  toObject, fromObject,
  getNodes, getEdges, vueFlowRef, } = useVueFlow();

//If enabled, a dialog will ask the user to confirm the deletion of elements
let confirmDelete = true;

//Delete nodes and edges
const deleteKey = 'Delete';

//Node intersecting
const panelEl = ref()
const isIntersectingWithPanel = ref(false)
const componentUtil = useComponentUtil();

//Edge renaming
const editingEdge = ref(null);

let mouseX = 0;
let mouseY = 0;

//Undo/Redo Stacks
const undoStack = [];
const redoStack = [];
const maxStackSize = 50;

/* Functions Start */

onInit((vueFlowInstance) => {
  vueFlowInstance.fitView();
});

onConnect(addEdges)

//Key event listener 
onMounted(() => {
  window.addEventListener('keydown', handleHotkeys);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHotkeys);
});

const handleHotkeys = (event) => {
  handleUndoRedoHotkeys(event);
}

/* Start node */

const startNode = ref(null);

watch(startNode, () => {

  for (const node of getNodes.value) {
    if (node == startNode.value) {
      node.data.isStartingNode = true;
    } else {
      delete node.data.isStartingNode;
    }
  }

});

/* Undo / Redo */

function pushToUndoStack() {
  const state = JSON.stringify(toObject());

  undoStack.push(state);
  if (undoStack.length > maxStackSize) {
    undoStack.shift(); // Maintain stack size
  }

  clearRedoStack();
}

//Allow other classes to inject this function so that they can notify the state of changes
provide('pushToUndoStack', pushToUndoStack);

function pushToRedoStack() {
  const state = JSON.stringify(toObject());

  redoStack.push(state);
  if (redoStack.length > maxStackSize) {
    redoStack.shift(); // Maintain stack size
  }
}

function clearRedoStack() {
  redoStack.value = [];
}

function undo() {
  //console.log(undoStack.length)

  if (undoStack.length > 0) {
    pushToRedoStack();

    const lastState = undoStack.pop();
    fromObject(JSON.parse(lastState));

    return true;
  }

  return false;
}

function redo() {
  if (redoStack.length > 0) {
    pushToUndoStack();

    const nextState = redoStack.pop();
    fromObject(JSON.parse(nextState));

    return true;
  }

  return false;
}

//CTRL-Z and CTRL-Y/CTRL_SHIFT_Z to undo and redo
const handleUndoRedoHotkeys = (event) => {

  if (event.ctrlKey && event.key === 'z') {
    if (undo()) {
      event.preventDefault();
    }
  } else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
    if (redo()) {
      event.preventDefault();
    }
  }

}

/* onNodesChange/onEdgesChange - allow for deleting/editing and recording program states */

//Node deletion & state recording
onNodesChange(async (changes) => {


  //Deleting Nodes
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {

        pushToUndoStack();
        componentUtil.deleteComponents(getNodes, change.id);
        nextChanges.push(change);

    } else {
      nextChanges.push(change)
    }
  }

  applyNodeChanges(nextChanges)
})

//Edge Deleting & state recording
onEdgesChange(async (changes) => {

  //Editing & Deleting Edges
  const nextChanges = []

  pushToUndoStack(JSON.stringify(toObject()));

  for (const change of changes) {
    if (change.type === 'select') {
      endEdgeEditing();
    }

    if (change.type === 'remove') {
        pushToUndoStack(JSON.stringify(toObject()));
        nextChanges.push(change)

    } else {
      nextChanges.push(change)
    }
  }

  applyEdgeChanges(nextChanges)
})

//Edge context
onEdgeDoubleClick((edgeMouseEvent) => {

  let event = edgeMouseEvent.event;
  let edge = edgeMouseEvent.edge;

  event.preventDefault();

  mouseX = edgeMouseEvent.sourceX;
  mouseY = edgeMouseEvent.sourceY;

  let items = [
    {
      label: "Delete Edge", onClick: () => {
        removeEdges(edge.id);
      },
    },
    {
      label: "Set Label", onClick: () => {
        editingEdge.value = edge;
      },
    },
  ];

  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    items
  })

});

const endEdgeEditing = () => {
  if (editingEdge) {
    editingEdge.value = null;
  }
}

/* Node Context Menus */

onNodeDoubleClick((nodeMouseEvent) => {

  let event = nodeMouseEvent.event;
  let node = nodeMouseEvent.node;

  event.preventDefault();

  let items = [
    {
      label: "Delete Node", onClick: () => {

        removeNodes(node.id);

        let edges = getEdges;
        let edgesToRemove = [];

        for (const edge of edges.value){
          if (edge.source == node.id || edge.target == node.id){
            edgesToRemove.push(edge);
          }
        }
        
        removeEdges(edgesToRemove);

      },
    },
  ];

  if (node.type == "text-area" || node.type == "text-field") {
    if (startNode.value != node) {
      items.push({
        label: "Set Start Node", onClick: () => { startNode.value = node; },
      });
    } else {
      items.push({
        label: "Disable Start Node", onClick: () => { startNode.value = null; },
      });
    }
  }

  if (node.type == 'component') {
    let attributes = node.data.attributes;

    if (attributes) {
      for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i] ? attributes[i] : "Attribute " + i;

        items.push({
          label: "Remove " + attribute, onClick: () => { node.data.attributes.splice(i, 1) }
        });
      }
    }

  }

  let components = node.data.components;

  if (components) {
    for (let i = 0; i < components.length; i++) {
      if (!components[i]) {
        continue;
      }

      let n = findNode(components[i]);

      let label = n && n.data.label ? n.data.label : components[i];

      items.push({
        label: "Remove " + label, onClick: () => { node.data.components.splice(i, 1) }
      });
    }
  }

  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    items
  })

  //console.log(pointerEvent + " " + node.id);

});

onEdgeContextMenu((edgeEvent) => {

  let event = edgeEvent.event;
  let edge = edgeEvent.edge;

  event.preventDefault();

  ContextMenu.showContextMenu({
    x: event.x,
    y: event.y,
    items: [
      {
        label: "Delete Connection", onClick: () => { removeEdges(edge.id); },
      },
    ]
  })

});

/* Show context menu for creating nodes */
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
          { label: "Component Node", onClick: () => { createNewNode(event, "component"); } },
          { label: "Jumper Node", onClick: () => { createNewNode(event, "jumper"); } },
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

/* Node/Component Intersecting */

onNodeDrag(({ node: draggedNode }) => {
  const nodes = getNodes;
  const intersections = getIntersectingNodes(draggedNode)
  const intersectionIds = intersections.map((intersection) => intersection.id)

  isIntersectingWithPanel.value = isNodeIntersecting(draggedNode, panelPosition.value)

  for (const node of nodes.value) {
    const isIntersecting = intersectionIds.includes(node.id)

    if (draggedNode == node) {
      //console.log("Node " + node.id);
      continue;
    }

    updateNode(node.id, { class: isIntersecting ? 'intersecting' : '' })

    if (isIntersecting && draggedNode.type == 'component') {
      componentUtil.connectComponent(node, draggedNode);
    }

  }
});

const panelPosition = computed(() => {
  if (!panelEl.value) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  }

  const { left, top, width, height } = panelEl.value.$el.getBoundingClientRect()

  return {
    ...screenToFlowCoordinate({ x: left, y: top }),
    width,
    height,
  }
})

/* Saving & Loading Data */

async function onReset() {
  const isConfirmed = await confirmDeleteDialog.confirmReset();

  if (isConfirmed) {

    confirmDelete = false;
    removeNodes(getNodes.value);

    vueFlowInstance.fitView();

  }

}

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

};

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
};

</script>


<template>

  <VueFlow :nodes="initialNodes" :edges="initialEdges" :delete-key-code=deleteKey
    :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2" :max-zoom="4">

    <!-- Creates Resizable Nodes with the ID 'resizable' (#node- tells us that its a node, the other half is the ID), 
     Then we copy the data required into the properties-->
    <template #node-text-field="nodeProps">
      <TextFieldNode :id="nodeProps.id" :data="nodeProps.data" />
    </template>

    <template #node-text-area="nodeProps">
      <TextAreaNode :id="nodeProps.id" :data="nodeProps.data" />
    </template>

    <template #node-component="nodeProps">
      <ComponentNode :id="nodeProps.id" :data="nodeProps.data" />
    </template>

    <template #node-jumper="nodeProps">
      <JumperNode :id="nodeProps.id" :data="nodeProps.data" />
    </template>

    <template #node-note="nodeProps">
      <NoteNode :id="nodeProps.id" :data="nodeProps.data" />
    </template>

    <!-- Background & Pattern -->
    <Background pattern-color="#aaa" :gap="16" />

    <!-- Toolbar -->
    <Controls position="top-left">

      <ControlButton title="New Project" @click="onReset">
        <Icon name="new-file" />
      </ControlButton>

      <ControlButton title="Save Project" @click="onSave">
        <Icon name="save" />
      </ControlButton>

      <ControlButton title="Load Project" @click="onLoad">
        <Icon name="load" />
      </ControlButton>

      <ControlButton title="Log `toObject` to Console" @click="console.log(toObject());">
        <Icon name="log" />
      </ControlButton>

    </Controls>

  </VueFlow>

  <!-- Label Renaming Dialog -->
  <div v-if="editingEdge" class="label-renaming-field" @keydown.escape="endEdgeEditing" tabindex="0">
    <input :id="'label-editor'" type="text" v-model="editingEdge.label" @focusout="endEdgeEditing"
      @keydown.enter="endEdgeEditing" @keydown.escape="endEdgeEditing" />
  </div>

</template>

<style></style>