<script setup lang="js">
import CreateEditDialog from "@/components/core/CreateEditDialog.vue";
import { computed, onMounted, ref, watch, onBeforeUnmount, nextTick } from "vue";
import { useFormErrors } from "@/mixins/FormErrorsMixin.js";
import { useEquipmentHolesStore } from "@/stores/user/equipmentHoles.js";
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { API_URL } from "@/utils/requests.js";

const emit = defineEmits(['close', 'apply']);

const props = defineProps({
  opened: Boolean,
  loading: Boolean,
  edit: Boolean,
  id: Number,
  item: Object,
  modelUrl: String,
  equipmentId: Number,
  info: Boolean
});

const formData = ref({
  name: '',
  offset_x: 0, offset_y: 0, offset_z: 0,
  normal_x: 0, normal_y: 0, normal_z: 0
});

const { getError, hasError, mapErrors, clearErrors } = useFormErrors();
const store = useEquipmentHolesStore();

const dialogTitle = computed(() => {
  if (props.info) return 'Информация о штуцере'
  return props.edit ? 'Редактирование штуцера' : 'Создание штуцера'
});
const submitText = computed(() => props.edit ? 'Обновить' : 'Создать');

// Three.js
const container = ref(null);
let scene, camera, renderer, controls, model;
let arrowHelper = null;
let markerSprite = null;
let raycaster = null;
let animationId = null;
let modelSize = 1; // Масштабный коэффициент модели

const initializeForm = async () => {
  if (props.edit && props.item) {
    formData.value = {
      name: props.item.name || '',
      offset_x: props.item.offset_x || 0,
      offset_y: props.item.offset_y || 0,
      offset_z: props.item.offset_z || 0,
      normal_x: props.item.normal_x || 0,
      normal_y: props.item.normal_y || 0,
      normal_z: props.item.normal_z || 0,
    };
  } else {
    formData.value = {
      name: '',
      offset_x: 0, offset_y: 0, offset_z: 0,
      normal_x: 0, normal_y: 0, normal_z: 0,
    };
  }
  updateVisuals();
};

const sendForm = async () => {
  const requestData = {
    name: formData.value.name,
    offset_x: formData.value.offset_x || 0,
    offset_y: formData.value.offset_y || 0,
    offset_z: formData.value.offset_z || 0,
    normal_x: formData.value.normal_x || 0,
    normal_y: formData.value.normal_y || 0,
    normal_z: formData.value.normal_z || 0,
    equipment: props.equipmentId,
  };

  try {
    if (!props.edit) await store.createItem(requestData);
    else await store.updateItem(props.id, requestData);
    emit('apply');
  } catch (errors) {
    mapErrors(errors);
  }
};

// Инициализация сцены
function initScene() {
  if (!container.value) return;

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;

  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);
  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(2, 5, 3);
  scene.add(mainLight);
  const fillLight = new THREE.PointLight(0x4466cc, 0.3);
  fillLight.position.set(-1, 2, 2);
  scene.add(fillLight);

  raycaster = new THREE.Raycaster();
  animate();

  loadModel(props.modelUrl);
}

function loadModel(url) {
  if (!url) return;

  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  const loader = new FBXLoader();

  loader.load(
    fullUrl,
    (fbx) => {
      if (model) scene.remove(model);
      model = fbx;

      // Вычисляем bounding box ДО добавления в сцену
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const minY = box.min.y;

      // Смещаем модель так, чтобы нижняя точка была на Y=0
      model.position.y = -minY;

      // Теперь добавляем в сцену
      scene.add(model);

      // Пересчитываем bounding box после смещения
      model.updateMatrixWorld(true);
      const newBox = new THREE.Box3().setFromObject(model);
      const center = newBox.getCenter(new THREE.Vector3());
      modelSize = Math.max(size.x, size.y, size.z);

      // Настраиваем камеру
      const distance = modelSize * 1.5;
      camera.position.set(center.x + distance, center.y + distance * 0.5, center.z + distance);
      controls.target.copy(center);
      controls.update();

      // Добавляем вспомогательные элементы
      setupHelpers(center);
      updateVisuals();

    },
    undefined,
    (error) => console.error('Ошибка загрузки модели:', error)
  );
}

function setupHelpers(center) {
  const oldGrid = scene.getObjectByName('gridHelper');
  const oldAxes = scene.getObjectByName('axesHelper');
  if (oldGrid) scene.remove(oldGrid);
  if (oldAxes) scene.remove(oldAxes);

  // Сетка теперь на уровне Y=0
  const gridSize = modelSize * 2;
  const divisions = Math.max(10, Math.floor(gridSize / (modelSize * 0.1)));
  const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x88aaff, 0x335588);
  gridHelper.name = 'gridHelper';
  gridHelper.position.y = 0; // Сетка на Y=0
  scene.add(gridHelper);

  // Оси тоже начинаются от Y=0
  const axesSize = modelSize * 1.2;
  const axesHelper = new THREE.AxesHelper(axesSize);
  axesHelper.name = 'axesHelper';
  axesHelper.position.y = 0;
  scene.add(axesHelper);
}


function updateVisuals() {
  if (!scene) return;

  const point = new THREE.Vector3(
    parseFloat(formData.value.offset_x) || 0,
    parseFloat(formData.value.offset_y) || 0,
    parseFloat(formData.value.offset_z) || 0
  );

  if (markerSprite) {
    scene.remove(markerSprite);
    markerSprite = null;
  }

  const sphereGeometry = new THREE.SphereGeometry(modelSize * 0.01, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xff3366,
    emissive: 0x441122,
    roughness: 0.3,
    metalness: 0.1
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  const pointLight = new THREE.PointLight(0xff3366, 0.5, 1);
  sphere.add(pointLight);

  sphere.position.copy(point);
  markerSprite = sphere;
  scene.add(markerSprite);

  if (arrowHelper) scene.remove(arrowHelper);

  const direction = new THREE.Vector3(
    parseFloat(formData.value.normal_x) || 0,
    parseFloat(formData.value.normal_y) || 0,
    parseFloat(formData.value.normal_z) || 0
  );

  if (direction.length() > 0.001) {
    direction.normalize();
    const arrowLength = modelSize * 0.15;
    const headLength = arrowLength * 0.3;
    const headWidth = arrowLength * 0.2;
    arrowHelper = new THREE.ArrowHelper(direction, point, arrowLength, 0xff3366, headLength, headWidth);
    scene.add(arrowHelper);
  }
}

function onCanvasClick(event) {
  if (!model || !raycaster || !camera || !renderer || props.info) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(model, true);

  const validIntersects = intersects.filter(hit => hit.object.isMesh && hit.face);

  if (validIntersects.length > 0) {
    const hit = validIntersects[0];

    const point = hit.point.clone();
    const normal = hit.face.normal.clone();
    normal.applyQuaternion(hit.object.quaternion);
    normal.normalize();

    formData.value.offset_x = parseFloat(point.x.toFixed(4));
    formData.value.offset_y = parseFloat(point.y.toFixed(4));
    formData.value.offset_z = parseFloat(point.z.toFixed(4));
    formData.value.normal_x = parseFloat(normal.x.toFixed(4));
    formData.value.normal_y = parseFloat(normal.y.toFixed(4));
    formData.value.normal_z = parseFloat(normal.z.toFixed(4));

    updateVisuals();
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function handleResize() {
  if (!container.value || !camera || !renderer) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function cleanupScene() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  if (controls) controls.dispose();
  if (scene) scene.clear();

  scene = camera = renderer = controls = model = raycaster = arrowHelper = markerSprite = null;

  if (container.value) {
    while (container.value.firstChild) container.value.removeChild(container.value.firstChild);
  }
}

watch(() => props.opened, async (newVal) => {
  if (newVal) {
    await initializeForm();
    await nextTick();
    if (container.value && !scene) initScene();
    clearErrors();
  } else {
    cleanupScene();
  }
});

onMounted(async () => {
  if (props.opened) {
    await initializeForm();
    await nextTick();
    if (container.value) initScene();
  }
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  cleanupScene();
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <create-edit-dialog
    :opened="opened"
    :loading="loading"
    :title="dialogTitle"
    :submit-text="submitText"
    :show-submit="!props.info"
    :cancel-text="props.info ? 'Выйти' : 'Отмена'"
    @cancel="emit('close')"
    @submit="sendForm"
    :max-width="1400"
  >
    <v-container fluid class="max-h-60">
      <v-row no-gutters class="fill-height">
        <v-col cols="8">
          <div ref="container" class="canvas-container" @click="onCanvasClick"></div>
        </v-col>
        <v-col cols="4" class="pa-4">
          <v-card elevation="3" class="pa-4">
            <v-text-field
              v-model="formData.name"
              label="Название"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :readonly="props.info"
              :error="hasError('name')"
              :error-messages="getError('name')"
            />

            <v-card-title>Позиция (X, Y, Z)</v-card-title>
            <v-row dense>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.offset_x"
                  type="number"
                  label="X"
                  step="0.01"
                  density="compact"
                  variant="outlined"
                  :readonly="props.info"
                  @update:model-value="updateVisuals"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.offset_y"
                  type="number"
                  label="Y"
                  step="0.01"
                  density="compact"
                  variant="outlined"
                  :readonly="props.info"
                  @update:model-value="updateVisuals"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.offset_z"
                  type="number"
                  label="Z"
                  step="0.01"
                  density="compact"
                  variant="outlined"
                  :readonly="props.info"
                  @update:model-value="updateVisuals"
                />
              </v-col>
            </v-row>

            <v-card-title>Нормаль (NX, NY, NZ)</v-card-title>
            <v-row dense>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.normal_x"
                  type="number"
                  label="NX"
                  step="0.01"
                  density="compact"
                  variant="outlined"
                  :readonly="props.info"
                  @update:model-value="updateVisuals"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.normal_y"
                  type="number"
                  label="NY"
                  step="0.01"
                  density="compact"
                  variant="outlined"
                  :readonly="props.info"
                  @update:model-value="updateVisuals"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.normal_z"
                  type="number"
                  label="NZ"
                  step="0.01"
                  density="compact"
                  variant="outlined"
                  :readonly="props.info"
                  @update:model-value="updateVisuals"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </create-edit-dialog>
</template>

<style scoped lang="scss">
.canvas-container {
  width: 100%;
  height: 75vh;
  position: relative;
  background: #0a0a1a;
  cursor: crosshair;
  border-radius: 8px;
  overflow: hidden;
}

.fill-height {
  height: 100%;
}
</style>
