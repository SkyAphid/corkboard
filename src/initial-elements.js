import { MarkerType } from '@vue-flow/core';
import { reactive } from 'vue';

export const initialNodes = reactive([
  // an input node, specified by using `type: 'input'`
  {
    id: '1',
    type: 'resizable',
    position: { x: 0, y: 0 },
    // all nodes can have a data object containing any data you want to pass to the node
    // a label can property can be used for default nodes
    data: { label: 'Node Resizer' },
    //style: { background: '#fff', border: '2px solid black' },
  },

  // a custom text-field node
  {
    id: '2',
    type: 'text-field',
    position: { x: 200, y: 0 },
    data: { label: 'Node 2' },
  },

  // An output node, specified by using `type: 'output'`
  {
    id: '3',
    type: 'text-area',
    position: { x: 500, y: 0 },
    data: { label: 'Node 3', body: 'Enter text here...' },
  },

  // A note node, for making notes
  {
    id: '4',
    type: 'note',
    position: { x: 300, y: 400 },
    data: { body: 'Write a note...' },
  },


]);

export const initialEdges = reactive([
  // default bezier edge
  // consists of an edge id, source node id and target node id
  {
    id: 'e1->2',
    source: '1',
    target: '2',
    label: 'test!',
    updatable: true,
  },

  // set `animated: true` to create an animated edge path
  {
    id: 'e2->3',
    source: '2',
    target: '3',
    label: 'test!',
    updatable: true,
  },

]);