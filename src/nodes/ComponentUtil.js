import { ref, h } from 'vue';

export function useComponentUtil() {

    //Connect component node to new parent
    const connectComponent = (node, componentNode) => {

        //Only connect components to actual nodes
        if (!(node.type == 'text-area')){
            return;
        }

        const components = node.data.components;

        if (components && !components.includes(componentNode.id)){
            components.push(componentNode.id);
            //console.log("Connect: " + componentNode.data.label + " -> " + node.data.label + " -> " + node.data.components);
        } else if (!components){
            node.data.components = [ componentNode.id ];
            //console.log("New Connect: " + componentNode.data.label + " -> " + node.data.label + " -> " + node.data.components);
        }

    }

    const addAttribute = (componentNode) => {
    
        const attributes = componentNode.data.attributes;
        const newAttribute = "New Attribute";

        if (attributes){
            attributes.push(newAttribute);
        } else if (!attributes){
            componentNode.data.attributes = [ newAttribute ];
        }

    }
    
    //If a component is deleted, it will be cleared out from any nodes that use it
    const deleteComponents = (nodes, componentNodeID) => {

        for (const node of nodes.value){

            //console.log(node.id);

            if (node.id == componentNodeID){
                continue;
            }

            const components = node.data.components;

            if (components){
                for (let j = 0; j < components.length; j++){
                    if (components[j] && components[j] == componentNodeID){
                        components.splice(j, 1);
                        //console.log("Remove " + nodeID);
                    }
                }
            }
        }


    }

    return {
        connectComponent, addAttribute, deleteComponents
    }


}