import { MarkerType } from '@vue-flow/core';
import { reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export const initialNodes = reactive([
  // an input node, specified by using `type: 'input'`
  {
    id: uuidv4(),
    type: 'text-area',
    position: { x: 0, y: 0 },
    // all nodes can have a data object containing any data you want to pass to the node
    // a label can property can be used for default nodes
    data: { label: 'Node 1', body: "" },
    //style: { background: '#fff', border: '2px solid black' },
  },

  // a custom text-field node
  {
    id: uuidv4(),
    type: 'text-field',
    position: { x: 400, y: 0 },
    data: { label: 'Node 2' },
  },

  // An output node, specified by using `type: 'output'`
  {
    id: uuidv4(),
    type: 'text-area',
    position: { x: 700, y: 0 },
    data: { label: 'Node 3', body: '' },
  },

  // A note node, for making notes
  {
    id: uuidv4(),
    type: 'note',
    position: { x: 300, y: 400 },
    data: { label: 'Note Node', body: 'Welcome!' },
  },

]);

export const initialEdges = reactive([
  // default bezier edge
  // consists of an edge id, source node id and target node id
  {
    id: uuidv4(),
    source: initialNodes[0].id,
    target: initialNodes[1].id,
    label: 'double-click to rename',
    updatable: true,
  },

  // set `animated: true` to create an animated edge path
  {
    id: uuidv4(),
    source: initialNodes[1].id,
    target: initialNodes[2].id,
    label: 'label',
    updatable: true,
  },

]);