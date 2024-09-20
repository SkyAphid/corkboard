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

import { useConfirmDeleteDialog } from './components/DialogConfirmDeleteUse.js'
import DialogConfirmDelete from './components/DialogConfirmDelete.vue'

import ResizableNode from './nodes/ResizableNode.vue'
import TextFieldNode from './nodes/TextFieldNode.vue'
import TextAreaNode from './nodes/TextAreaNode.vue'
import ComponentNode from './nodes/ComponentNode.vue'
import { useComponentUtil } from './nodes/ComponentUtil.js'
import NoteNode from './nodes/NoteNode.vue'

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
const confirmDeleteDialog = useConfirmDeleteDialog();

//Node intersecting
const panelEl = ref()
const isIntersectingWithPanel = ref(false)
const componentUtil = useComponentUtil();

//Edge renaming
const editingEdge = ref(null);
const edgeLabelFocused = false;

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

      if (await canDelete(change)) {
        pushToUndoStack();
        componentUtil.deleteComponents(getNodes, change.id);
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  confirmDelete = true;
  applyNodeChanges(nextChanges)
})

//Edge Deleting & state recording
onEdgesChange(async (changes) => {

  //Editing & Deleting Edges
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'select') {
      pushToUndoStack(JSON.stringify(toObject()));
      endEdgeEditing();
    }

    if (change.type === 'remove') {
      if (await canDelete(change)) {
        pushToUndoStack(JSON.stringify(toObject()));
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  confirmDelete = true;
  applyEdgeChanges(nextChanges)
})

async function canDelete(change) {
  if (confirmDelete) {
    //await causes the isConfirmed const to wait on a response from the dialog.confirmDefault function
    return await confirmDeleteDialog.confirmDefault(change.id);
  }

  return true;
}

//Edge Renaming
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

  let items = [
    {
      label: "Delete Node", onClick: () => { removeNodes(node.id) },
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
    x: pointerEvent.x,
    y: pointerEvent.y,
    items
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
          { label: "Component Node", onClick: () => { createNewNode(event, "component"); } },
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

/* Node Intersecting */

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

    <template #node-component="componentNodeProps">
      <ComponentNode :id="componentNodeProps.id" :data="componentNodeProps.data" />
    </template>

    <template #node-note="noteNodeProps">
      <NoteNode :id="noteNodeProps.id" :data="noteNodeProps.data" />
    </template>

    <!-- Background & Pattern -->
    <Background pattern-color="#aaa" :gap="16" />

    <DialogConfirmDelete />

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
  <div v-if="editingEdge" class="label-renaming-field">
    <input :id="'label-editor'" type="text" v-model="editingEdge.label" @focusout="endEdgeEditing"
      @keydown.enter="endEdgeEditing" @keydown.escape="endEdgeEditing" />
  </div>

</template>

<style></style>