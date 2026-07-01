<script setup lang="js">
import {computed, onBeforeUnmount, onMounted, ref, watchEffect} from "vue";
import {useRoute} from "vue-router";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/core/auth.js";
import '@anilkumarthakur/vue3-json-viewer/styles.css';
import {useResultsStore} from "@/stores/user/results.js";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const store = useResultsStore()
const authStore = useAuthStore()
const route = useRoute()

const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const preloadedData = computed(() => store.getFull)
const loading = computed(() => {
  return store.isLoadingFull
})

const canvasContainer = ref(null);
let scene, camera, renderer, controls;

async function initThree() {
  // 1. Сцена
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xCCDDEE); // тёмно-синий фон

  // 2. Камера (перспективная)
  camera = new THREE.PerspectiveCamera(45, canvasContainer.value.clientWidth / canvasContainer.value.clientHeight, 0.1, 30000);
  camera.position.set(500, 400, 800);
  camera.lookAt(200, 200, 150);

  // 3. Рендерер
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight);
  renderer.shadowMap.enabled = true; // если захотим тени позже
  canvasContainer.value.appendChild(renderer.domElement);

  // 4. Управление камерой
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.target.set(200, 200, 150);

  // 5. Освещение (предлагаю комбинированное)
  // Ambient — общая подсветка (ярче и теплее)
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));

// Основной направленный свет (ярче)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(200, 500, -300);
  dirLight.castShadow = true;
  dirLight.receiveShadow = true;
  scene.add(dirLight);

// Заполняющий свет спереди (важно для презентаций!)
  const fillLight1 = new THREE.PointLight(0xffffff, 0.8);
  fillLight1.position.set(-100, 200, 400);
  scene.add(fillLight1);

// Второй заполняющий свет с другой стороны
  const fillLight2 = new THREE.PointLight(0x88aacc, 0.6);
  fillLight2.position.set(600, 300, -200);
  scene.add(fillLight2);

  // 6. Сетка на полу (статичная)
  const floorGeometry = new THREE.PlaneGeometry(10000, 10000);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // поворачиваем горизонтально
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // 7. Запускаем рендеринг
  animate();
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/');
    return;
  }

  // 1. Загружаем данные
  await store.loadFull(Number(route.params.id));

  // 2. Инициализируем сцену (если ещё не инициализирована)
  if (!scene) {
    await initThree(); // вынесем инициализацию в отдельную функцию
  }

  // 3. Теперь данные точно есть, строим сцену
  if (preloadedData.value) {
    await buildSceneFromData(preloadedData.value);
  }
});
let animationId = null;

function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

watchEffect(async () => {
  if (preloadedData.value && scene) {
    await buildSceneFromData(preloadedData.value);
  }
});

const loader = new FBXLoader();

function fitCameraToScene() {
  if (!scene || !camera || !controls) return;

  // Собираем все меши в сцене
  const meshes = [];
  scene.traverse(obj => {
    if (obj.isMesh) meshes.push(obj);
  });

  if (meshes.length === 0) return;

  // Вычисляем общий bounding box
  const box = new THREE.Box3();
  meshes.forEach(mesh => {
    mesh.updateWorldMatrix(true, true);
    if (mesh.geometry) {
      mesh.geometry.computeBoundingBox();
      const meshBox = new THREE.Box3().copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      box.union(meshBox);
    }
  });

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Устанавливаем центр вращения
  controls.target.copy(center);

  // Расстояние от камеры, чтобы охватить всю сцену
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let distance = maxDim / (2 * Math.tan(fov / 2));
  distance *= 1.5; // небольшой запас

  // Направление камеры (например, изометрическое)
  const dir = new THREE.Vector3(1, 1, 1).normalize();
  camera.position.copy(center.clone().add(dir.multiplyScalar(distance)));
  camera.lookAt(center);

  controls.update();
}

async function buildSceneFromData(data) {
  const { equipments, connections } = data;

  // Загружаем все оборудования параллельно
  const equipmentPromises = equipments.map(eq => {
    return new Promise((resolve, reject) => {
      loader.load(eq.model,
        (fbx) => {
          // Позиция
          fbx.position.set(eq.x, eq.y, eq.z);
          // Вращение: rotate_y в градусах -> радианы
          fbx.rotation.y = THREE.MathUtils.degToRad(eq.rotate_y);

          // Применяем материал
          fbx.traverse((child) => {
            if (child.isMesh) {
              // Если в FBX уже есть материал, модифицируем его
              if (Array.isArray(child.material)) {
                child.material = child.material.map(mat => updateMaterial(mat, eq));
              } else {
                child.material = updateMaterial(child.material, eq);
              }
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(fbx);
          resolve(fbx);
        },
        undefined,
        reject
      );
    });
  });

  await Promise.all(equipmentPromises);
  addConnections(connections);

// Даём кадру время на обновление матриц
  requestAnimationFrame(() => {
    fitCameraToScene();
  });
}

function updateMaterial(material, eq) {
  // Клонируем, чтобы не влиять на другие экземпляры
  const newMat = material.clone();
  newMat.color.set(eq.base_color);
  newMat.emissive = new THREE.Color(eq.base_color);
  newMat.emissiveIntensity = 0.3; // лёгкое свечение для видимости
  // Для PBR-подобных свойств используем StandardMaterial
  if (newMat instanceof THREE.MeshStandardMaterial) {
    newMat.metalness = eq.reflectivity ?? 0.5;
    newMat.roughness = 1 - (eq.shininess ?? 0.5); // shininess обычно обратно roughness
    newMat.transparent = eq.transparency > 0;
    newMat.opacity = 1 - eq.transparency;
  }
  return newMat;
}

function addConnections(connections) {
  connections.forEach(conn => {
    const points = conn.points.sort((a, b) => a.index - b.index);
    if (points.length < 2) return;

    const material = new THREE.MeshStandardMaterial({
      color: conn.base_color,
      transparent: conn.transparency > 0,
      opacity: 1 - conn.transparency,
      roughness: 1 - (conn.shininess ?? 0.5),
      metalness: conn.reflectivity ?? 0.5,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: conn.base_color,
      transparent: conn.transparency > 0,
      opacity: 1 - conn.transparency,
      roughness: 1 - (conn.shininess ?? 0.5),
      metalness: conn.reflectivity ?? 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -1,  // Отрицательное значение = рисовать под
      polygonOffsetUnits: -1,
    });

    const r = conn.r;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
      const p2 = new THREE.Vector3(points[i+1].x, points[i+1].y, points[i+1].z);

      // Вычисляем направление сегмента
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const length = p1.distanceTo(p2);

      // Создаём цилиндр для прямого сегмента
      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, length, 16),
        material
      );

      const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      cylinder.position.copy(center);
      cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir
      );

      cylinder.castShadow = true;
      cylinder.receiveShadow = true;
      scene.add(cylinder);

      // Строим сферы в точках соединения (вместо сложных поворотов)
      // Но только для внутренних точек (не для концов)
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 16),
        sphereMaterial
      );
      sphere.position.copy(p1);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);
    }

    // Добавляем сферу в последнюю точку
    const lastPoint = new THREE.Vector3(
      points[points.length-1].x,
      points[points.length-1].y,
      points[points.length-1].z
    );
    const lastSphere = new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 16),
      material
    );
    lastSphere.position.copy(lastPoint);
    lastSphere.castShadow = true;
    lastSphere.receiveShadow = true;
    scene.add(lastSphere);
  });
}

function onWindowResize() {
  if (!canvasContainer.value) return;
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize);

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
  window.removeEventListener('resize', onWindowResize);
});

</script>

<template>
  <v-row no-gutters style="height: 100%; background: #EEE">
    <v-col cols="12" style="height: 100px; border-bottom: 1px solid black; background: white; color: #1e1e1e;">
      <v-btn flat size="99" rounded="0" style="border-right: 1px solid black;" class="pa-1" @click="router.push('/results')" :disabled="loading">
        <v-row no-gutters>
          <v-col cols="12">
            <v-icon class="mr-2" size="30" color="red">mdi-backspace-outline</v-icon>
          </v-col>
          <v-col cols="12">
            <span style="color: #1e1e1e; text-transform: none; letter-spacing: 0; text-wrap: auto; font-size: 13px;">Вернуться к списку</span>
          </v-col>
        </v-row>
      </v-btn>
    </v-col>
    <v-col cols="12" style="height: calc(100% - 100px); color: #1e1e1e; overflow: hidden; position: relative;">
      <div ref="canvasContainer" style="width: 100%; height: 100%;"></div>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">

</style>
