<script setup lang="js">
import {useModelConstructorStore} from "@/stores/old/modelConstructor.js";
import * as THREE from 'three';
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {
  getSystemCoordinatePlaneColor,
  hexToThreeJsColor,
  SCENE_OBJECT_TYPES
} from "@/utils/three.js";

const emit = defineEmits(['selected'])

const props = defineProps({
  sketch: {
    type: Boolean,
    required: true
  }
})

const store = useModelConstructorStore()
const object = computed(() => store.getObject)
const partMaterial = ref({
  color: '#333333',
  reflectivity: 0.5,
})

const sceneContainer = ref(null)
const sceneWidth = ref(500)
const sceneHeight = ref(500)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, sceneWidth.value / sceneHeight.value, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ alpha: true })
const raycaster = new THREE.Raycaster()
const sceneObjects = ref([])
const selectedObject = ref(null)
const highlightColor = 0xFFFF00

const setPartMaterial = (part) => {
  partMaterial.value.color = part.material.base_color
  partMaterial.value.reflectivity = part.material.reflectivity
}

const setSceneSizes = () => {
  window.addEventListener('resize', resizeHandler)
  resizeHandler()
}

const setSceneLight = () => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7)
  scene.add(directionalLight)
}

const moveSpeed = 0.1
const rotationSpeed = 0.02
const keysPressed = ref({})

const updateCameraMovement = () => {
  const forward = new THREE.Vector3()
  camera.getWorldDirection(forward)
  forward.normalize();

  const right = new THREE.Vector3()
  right.crossVectors(camera.up, forward).normalize()

  const keyHandlers = {
    'w': () => camera.position.add(forward.clone().multiplyScalar(moveSpeed)),
    's': () => camera.position.add(forward.clone().multiplyScalar(-moveSpeed)),
    'a': () => camera.position.add(right.clone().multiplyScalar(moveSpeed)),
    'd': () => camera.position.add(right.clone().multiplyScalar(-moveSpeed)),
    ' ': () => camera.position.y += moveSpeed,
    'control': () => camera.position.y -= moveSpeed,
    'arrowup': () => camera.rotateX(rotationSpeed),
    'arrowdown': () => camera.rotateX(-rotationSpeed),
    'arrowleft': () => camera.rotateY(rotationSpeed),
    'arrowright': () => camera.rotateY(-rotationSpeed)
  };

  Object.entries(keyHandlers).forEach(([key, handler]) => {
    if (keysPressed.value[key]) {
      handler();
    }
  });

  camera.updateMatrixWorld();
}

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

const setupMouseControls = () => {
  if (!sceneContainer.value) return;

  const element = sceneContainer.value;

  element.addEventListener('mousedown', (event) => {
    mouseDown = true;
    lastMouseX = event.clientX
    lastMouseY = event.clientY
    element.focus()
    event.preventDefault()
  });

  window.addEventListener('mousemove', (event) => {
    if (!mouseDown) return;

    const deltaX = event.clientX - lastMouseX
    const deltaY = event.clientY - lastMouseY

    camera.rotateY(-deltaX * 0.005)
    camera.rotateX(-deltaY * 0.005)

    lastMouseX = event.clientX
    lastMouseY = event.clientY
  });

  window.addEventListener('mouseup', () => {
    mouseDown = false
  });
}

const clearHighlight = () => {
  if (!selectedObject.value) return

  if (selectedObject.value.userData.type === 'plane') {
    selectedObject.value.material.color.set(selectedObject.value.userData.color)
    selectedObject.value.material.opacity = 0.15
    selectedObject.value.userData.edges.material.color.set(selectedObject.value.userData.edges.userData.color)
    selectedObject.value.userData.edges.material.linewidth = 1
  }

  selectedObject.value = null

}

watch(() => selectedObject.value, (nVal) => {
  emit('selected', nVal)
})

const highlightObject = (object) => {
  clearHighlight()

  selectedObject.value = object

  if (object.userData.type === 'plane') {
    object.material.color.set(highlightColor)
    object.material.opacity = 0.3

    object.userData.edges.material.color.set(highlightColor)
    object.userData.edges.material.linewidth = 2
  }
}

const sceneClickHandler = (event) => {
  const element = sceneContainer.value
  const rect = element.getBoundingClientRect()
  let mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(mouse, camera)

  const selectableObjects = scene.children.filter(child =>
    child.userData && child.userData.isSelectable !== false && SCENE_OBJECT_TYPES.includes(child.userData.type)
  )

  const intersects = raycaster.intersectObjects(selectableObjects)

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object

    const objectToSelect = clickedObject.userData.type === 'edges'
      ? clickedObject.userData.object
      : clickedObject

    highlightObject(objectToSelect)
    return

  }

  clearHighlight()
}

const setupClickHandler = () => {
  if (!sceneContainer.value) return
  const element = sceneContainer.value
  element.addEventListener('click', sceneClickHandler)
}

const rendererCycle = () => {
  updateCameraMovement()
  renderer.render(scene, camera)
  requestAnimationFrame(rendererCycle)
}

const setCameraPosition = (x = 4, y = 3, z = 5, target_x = 0, target_y = 0, target_z = 0) => {
  camera.position.z = x;
  camera.position.y = y;
  camera.position.x = z;
  camera.lookAt(new THREE.Vector3(target_x, target_y, target_z));
}

const setStartingGrid = () => {
  const gridHelper = new THREE.GridHelper(10, 20);
  scene.add(gridHelper);
}

const addPlane = (planeObj, offset = {x: 0, y: 0, z: 0}, color = '#00FF00') => {
  let normal = {
    x: planeObj.normal_x,
    y: planeObj.normal_y,
    z: planeObj.normal_z
  }

  const planeGeometry = new THREE.PlaneGeometry(3, 3)
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: hexToThreeJsColor(color),
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)

  plane.position.set(offset.x, offset.y, offset.z)

  const normalizedNormal = new THREE.Vector3(normal.x, normal.y, normal.z).normalize()
  const targetPoint = new THREE.Vector3(
    offset.x + normalizedNormal.x,
    offset.y + normalizedNormal.y,
    offset.z + normalizedNormal.z
  )
  plane.lookAt(targetPoint)

  const edgesGeometry = new THREE.EdgesGeometry(planeGeometry)
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: hexToThreeJsColor(color),
    linewidth: 1
  })
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  edges.position.copy(plane.position)
  edges.setRotationFromQuaternion(plane.quaternion)

  edges.userData = {
    type: 'edges',
    isSelectable: false,
    object: plane,
    color: hexToThreeJsColor(color)
  }

  plane.userData = {
    type: 'plane',
    id: planeObj.id,
    data: planeObj,
    isSelectable: true,
    edges: edges,
    color: hexToThreeJsColor(color)
  }

  sceneObjects.value.push(plane)
  scene.add(plane)
  scene.add(edges)

  return plane
}

const addCoordinateSystem = (system) => {
  const offset = {
    x: system.offset_x,
    y: system.offset_y,
    z: system.offset_z
  };

  const xAxis = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(offset.x, offset.y, offset.z),
    3,
    0xff0000
  );

  const yAxis = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(offset.x, offset.y, offset.z),
    3,
    0x00ff00
  );

  const zAxis = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(offset.x, offset.y, offset.z),
    3,
    0x0000ff
  );

  scene.add(xAxis);
  scene.add(yAxis);
  scene.add(zAxis);

  for (let plane of system.planes) {
    addPlane(
      plane,
      offset,
      getSystemCoordinatePlaneColor(plane)
    );
  }
};

const parseCoordinateSystems = () => {
  for (let system of object.value.coordinate_systems) {
    addCoordinateSystem(system);
  }
};

const parseProjectObjects = () => {
  parseCoordinateSystems()
}

const sketchStartedHandler = () => {
  const planePos = selectedObject.value.position.clone();
  const planeNormal = new THREE.Vector3();
  selectedObject.value.getWorldDirection(planeNormal);

  const distance = 5;
  const cameraOffset = planeNormal.clone().multiplyScalar(-distance);
  camera.position.copy(planePos).add(cameraOffset);
  camera.lookAt(planePos);

  camera.updateMatrixWorld();
  clearHighlight()
}

watch(() => props.sketch, (nVal) => {
  if (nVal) sketchStartedHandler()
})

const prepareScene = () => {
  setPartMaterial(object.value)
  setSceneLight()
  setupKeyboardControls()
  setupMouseControls()
  setupClickHandler()
  setSceneSizes()
  setCameraPosition()
  setStartingGrid()
  parseProjectObjects()
  sceneContainer.value.appendChild(renderer.domElement)
  rendererCycle()
}

const keyDownHandler = (event) => {
  const usedKeys = ['w', 'a', 's', 'd', ' ', 'control', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  if (usedKeys.includes(event.key.toLowerCase())) event.preventDefault()
  keysPressed.value[event.key.toLowerCase()] = true
}

const keyUpHandler = (event) => {
  keysPressed.value[event.key.toLowerCase()] = false
}

const resizeHandler = () => {
  if (!sceneContainer.value) return

  sceneWidth.value = sceneContainer.value.offsetWidth
  sceneHeight.value = sceneContainer.value.offsetHeight
  renderer.setSize(sceneWidth.value, sceneHeight.value)
  camera.aspect = sceneWidth.value / sceneHeight.value
  camera.updateProjectionMatrix()
}

const setupKeyboardControls = () => {
  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)
}

const removeKeyboardControls = () => {
  window.removeEventListener('keydown', keyDownHandler)
  window.removeEventListener('keyup', keyUpHandler)
}

onMounted(() => {
  nextTick(() => {
    prepareScene()
  })
})

onUnmounted(() => {
  removeKeyboardControls()
  window.removeEventListener('resize', resizeHandler)
  renderer.setAnimationLoop(null)
})
</script>

<template>
  <v-col cols="10" class="ma-0 pa-0">
    <div
      ref="sceneContainer"
      tabindex="0"
      style="width: 100%; height: 100%; outline: none;"
    ></div>
  </v-col>
</template>

<style scoped lang="scss">
</style>
