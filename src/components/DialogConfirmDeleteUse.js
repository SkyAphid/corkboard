import { ref, h } from 'vue'

/**
 * In a real world example you would want to avoid creating refs in a global scope like this
 */
const isVisible = ref(false)
const message = ref('')
let confirmDeleteCallback

export function useDialogConfirmDelete() {
  return {
    isVisible,
    message,
    confirmDeletion: (value) => {
      //Checks if the confirmDeleteCallback has been set, and if so, call it
      if (confirmDeleteCallback) {
        confirmDeleteCallback(value)
      }
    }
  }
}

export function useConfirmDeleteDialog() {
  return{
    confirm,
    confirmDefault
  }
}

function confirm(msg) {
  isVisible.value = true
  message.value = msg
  return new Promise((confirmDeletion) => {
    confirmDeleteCallback = confirmDeletion
  })
}

function confirmDefault(id){
  return confirm(h(
    'span',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      },
    },
    [`Are you sure?`, h('br'), h('span', `[ELEMENT_ID: ${id}]`)],
  ));
}

//Another way
/*export function useDialog() {
  return {
    confirm(msg) {
      isVisible.value = true
      message.value = msg
      return new Promise((resolve) => {
        resolveCallback = resolve
      })
    },
  }
}*/
