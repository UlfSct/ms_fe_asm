import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

export const SCENE_OBJECT_TYPES = ['plane', 'edges', 'sketch']

export const getSystemCoordinatePlaneColor = (plane) => {
  if (plane.name === 'XY') return '#0000FF'
  if (plane.name === 'YZ') return '#FF0000'
  if (plane.name === 'XZ') return '#00FF00'
  return '#0000FF'
}

export const hexToThreeJsColor = (hexColor) => {
  const hex = hexColor.replace('#', '')

  let fullHex = hex
  if (hex.length === 3) {
    fullHex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  return parseInt(fullHex, 16)
}


export const threeJsColorToHex = (threeJsColor) => {
  let hexString = threeJsColor.toString(16)

  while (hexString.length < 6) {
    hexString = '0' + hexString
  }

  return '#' + hexString
}


export async function getModelDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const loader = new FBXLoader();

    loader.load(
      url,
      (object) => {
        const bbox = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        URL.revokeObjectURL(url);
        resolve({
          width: size.x,
          height: size.y,
          depth: size.z
        });
      },
      undefined,
      (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      }
    );
  });
}
