<script setup lang="js">
import {computed, onMounted, ref, onUnmounted, watch, nextTick} from "vue";
import {useSchemesStore} from "@/stores/user/schemes.js";
import {useRoute} from "vue-router";
import router from "@/router/index.js";
import {useSelectorsStore} from "@/stores/core/selectors.js";
import {useAuthStore} from "@/stores/core/auth.js";
import AddEquipmentDialog from "@/views/2d/AddEquipmentDialog.vue";
import {useIdMixin} from "@/mixins/IndividualIdMixin.js";
import {API_URL} from "@/utils/requests.js";
import EditConnectionsDialog from "@/views/2d/EditConnectionsDialog.vue";
import EditDeleteEquipmentDialog from "@/views/2d/EditDeleteEquipmentDialog.vue";
import '@anilkumarthakur/vue3-json-viewer/styles.css';

const store = useSchemesStore()
const authStore = useAuthStore()
const selectorsStore = useSelectorsStore()
const route = useRoute()
const { getId } = useIdMixin()

const scheme = ref({
  equipments: [],
  connections: []
})
const addEquipmentDialogOpened = ref(false)
const editConnectionsDialogOpened = ref(false)
const editDeleteEquipmentDialogOpened = ref(false)
const selectedEquipmentId = ref(null)
const selectedEquipment = ref(null)
const equipmentConnections = ref([])
const equipmentHoles = ref([])
const outerAvailableHoles = ref([])

const canvasRef = ref(null)
const viewport = ref({
  x: 0,
  z: 0
})
const isPanning = ref(false)
const panStart = ref({ x: 0, z: 0 })
const draggingEquipment = ref(null)
const dragOffset = ref({ x: 0, z: 0 })
const equipmentElements = ref({})

const isAuthenticated = computed(() => authStore.getIsAuthenticated)
const preloadedScheme = computed(() => store.getScheme)
const equipments = computed(() => selectorsStore.getEquipments)
const materials = computed(() => selectorsStore.getMaterials)
const loading = computed(() => {
  return store.isLoadingScheme
    || selectorsStore.isLoadingEquipments
    || selectorsStore.isLoadingMaterials
})
const loadingUpdate = computed(() => store.isLoadingSchemeUpdate)
const connectionsWithScreenPoints = computed(() => {
  return scheme.value.connections.map(conn => {
    if (!conn.points || conn.points.length === 0) return { id: conn.id, screenPoints: '' }
    const screenPoints = conn.points.map(p => {
      const x = p.x + viewport.value.x
      const z = p.z + viewport.value.z
      return `${x},${z}`
    }).join(' ')
    return { id: conn.id, screenPoints }
  })
})

const recalculateEditConnectionsForm = (id) => {
  equipmentHoles.value = []
  outerAvailableHoles.value = []
  equipmentConnections.value = []
  const usedHoles = scheme.value.connections.map((item) => {
    return {
      start: item.scheme_equipment_hole_start,
      end: item.scheme_equipment_hole_end
    }
  })

  for (let equipment of scheme.value.equipments) {
    for (let hole of equipment.holes) {
      if (equipment.id !== id) continue
      equipmentHoles.value.push(hole)
    }
  }

  const currentEquipmentHolesIds = equipmentHoles.value.map((item) => item.id)
  for (let equipment of scheme.value.equipments) {
    if (equipment.id === id) continue
    for (let hole of equipment.holes) {
      let connectionEndIsHole = usedHoles.map((item) => item.end).includes(hole.id)
      let connectionStartIsHole = usedHoles.map((item) => item.start).includes(hole.id)
      let connectionObject = usedHoles.filter((item) => item.end === hole.id || item.start === hole.id)[0]
      let allowPush = !connectionStartIsHole && !connectionEndIsHole
      if (connectionEndIsHole && connectionObject) {
        allowPush ||= currentEquipmentHolesIds.includes(connectionObject.start)
      }
      if (connectionStartIsHole && connectionObject) {
        allowPush ||= currentEquipmentHolesIds.includes(connectionObject.end)
      }
      if (allowPush) {
        outerAvailableHoles.value.push({
          ...hole,
          selectorName: `${hole.name} (${equipment.equipmentName} [${equipment.id}])`
        })
      }
    }
  }
  for (let equipment of scheme.value.equipments) {
    if (equipment.id !== id) continue
    for (let connection of scheme.value.connections) {
      let connection_start = connection.scheme_equipment_hole_start
      let connection_end = connection.scheme_equipment_hole_end
      for (let hole of equipment.holes) {
        if (hole.id === connection_start) {
          equipmentConnections.value.push(connection)
          continue
        }
        if (hole.id === connection_end) {
          equipmentConnections.value.push({
            ...connection,
            reverse: true
          })
        }
      }
    }
    break
  }
}

// Поиск оборудования по id отверстия
const getEquipmentByHoleId = (holeId) => {
  for (const eq of scheme.value.equipments) {
    if (eq.holes.some(h => h.id === holeId)) return eq
  }
  return null
}


const getEquipmentBounds = (equipment) => {
  const element = equipmentElements.value[equipment.id]
  let iconOffsetX = 0
  let iconOffsetY = 0

  if (element) {
    const icon = element.querySelector('.equipment-icon')
    if (icon) {
      // Получаем смещение иконки внутри .equipment-item
      const elementRect = element.getBoundingClientRect()
      const iconRect = icon.getBoundingClientRect()
      iconOffsetX = iconRect.left - elementRect.left
      iconOffsetY = iconRect.top - elementRect.top
    }
  }

  const iconWidth = 60
  const iconHeight = 60

  return {
    x: equipment.x + iconOffsetX,
    z: equipment.z + iconOffsetY,
    width: iconWidth,
    height: iconHeight,
    centerX: equipment.x + iconOffsetX + iconWidth / 2,
    centerZ: equipment.z + iconOffsetY + iconHeight / 2
  }
}

// Находим ближайшие точки на гранях иконок
// Находим ближайшие точки на гранях иконок с улучшенной проверкой пересечений
const getClosestEdgePoints = (bounds1, bounds2) => {
  // Точки из ЦЕНТРОВ граней (а не углов)
  const edges1 = [
    { x: bounds1.x, z: bounds1.centerZ, axis: 'vertical', bounds: bounds1 },     // левая грань (центр)
    { x: bounds1.x + bounds1.width, z: bounds1.centerZ, axis: 'vertical', bounds: bounds1 }, // правая грань (центр)
    { x: bounds1.centerX, z: bounds1.z, axis: 'horizontal', bounds: bounds1 },    // верхняя грань (центр)
    { x: bounds1.centerX, z: bounds1.z + bounds1.height, axis: 'horizontal', bounds: bounds1 } // нижняя грань (центр)
  ]

  const edges2 = [
    { x: bounds2.x, z: bounds2.centerZ, axis: 'vertical', bounds: bounds2 },
    { x: bounds2.x + bounds2.width, z: bounds2.centerZ, axis: 'vertical', bounds: bounds2 },
    { x: bounds2.centerX, z: bounds2.z, axis: 'horizontal', bounds: bounds2 },
    { x: bounds2.centerX, z: bounds2.z + bounds2.height, axis: 'horizontal', bounds: bounds2 }
  ]

  let minDistance = Infinity
  let bestPoint1 = null
  let bestPoint2 = null

  for (const p1 of edges1) {
    for (const p2 of edges2) {
      const isParallel = (p1.axis === p2.axis)

      // Для параллельных граней нужен дополнительный излом
      if (isParallel) {
        // Проверяем, не будет ли линия пересекать иконки
        if (wouldIntersectIconsParallel(p1, p2, bounds1, bounds2)) {
          continue
        }

        const dx = p2.x - p1.x
        const dz = p2.z - p1.z
        const distance = dx * dx + dz * dz

        if (distance < minDistance) {
          minDistance = distance
          bestPoint1 = p1
          bestPoint2 = p2
        }
      } else {
        // Для перпендикулярных граней - прямой угол
        if (wouldIntersectIconsPerpendicular(p1, p2, bounds1, bounds2)) {
          continue
        }

        const dx = p2.x - p1.x
        const dz = p2.z - p1.z
        const distance = dx * dx + dz * dz

        if (distance < minDistance) {
          minDistance = distance
          bestPoint1 = p1
          bestPoint2 = p2
        }
      }
    }
  }

  // Fallback если все варианты пересекают иконки
  if (!bestPoint1 || !bestPoint2) {
    for (const p1 of edges1) {
      for (const p2 of edges2) {
        const dx = p2.x - p1.x
        const dz = p2.z - p1.z
        const distance = dx * dx + dz * dz

        if (distance < minDistance) {
          minDistance = distance
          bestPoint1 = p1
          bestPoint2 = p2
        }
      }
    }
  }

  return { point1: bestPoint1, point2: bestPoint2 }
}

// Проверка пересечения для перпендикулярных граней
const wouldIntersectIconsPerpendicular = (p1, p2, bounds1, bounds2) => {
  // Первая вертикальная, вторая горизонтальная
  if (p1.axis === 'vertical' && p2.axis === 'horizontal') {
    // Путь: (p1.x, p1.z) -> (p2.x, p1.z) -> (p2.x, p2.z)
    // Проверяем горизонтальный сегмент на пересечение с bounds1
    const midZ = p1.z
    const xMin = Math.min(p1.x, p2.x)
    const xMax = Math.max(p1.x, p2.x)

    // Проверяем пересечение с первой иконкой
    if (midZ > bounds1.z && midZ < bounds1.z + bounds1.height &&
      xMin < bounds1.x + bounds1.width && xMax > bounds1.x) {
      return true
    }

    // Проверяем вертикальный сегмент на пересечение с bounds2
    const midX = p2.x
    const zMin = Math.min(p1.z, p2.z)
    const zMax = Math.max(p1.z, p2.z)

    if (midX > bounds2.x && midX < bounds2.x + bounds2.width &&
      zMin < bounds2.z + bounds2.height && zMax > bounds2.z) {
      return true
    }
  }

  // Первая горизонтальная, вторая вертикальная
  if (p1.axis === 'horizontal' && p2.axis === 'vertical') {
    // Путь: (p1.x, p1.z) -> (p1.x, p2.z) -> (p2.x, p2.z)
    const midX = p1.x
    const zMin = Math.min(p1.z, p2.z)
    const zMax = Math.max(p1.z, p2.z)

    // Проверяем вертикальный сегмент на пересечение с bounds1
    if (midX > bounds1.x && midX < bounds1.x + bounds1.width &&
      zMin < bounds1.z + bounds1.height && zMax > bounds1.z) {
      return true
    }

    // Проверяем горизонтальный сегмент на пересечение с bounds2
    const midZ = p2.z
    const xMin = Math.min(p1.x, p2.x)
    const xMax = Math.max(p1.x, p2.x)

    if (midZ > bounds2.z && midZ < bounds2.z + bounds2.height &&
      xMin < bounds2.x + bounds2.width && xMax > bounds2.x) {
      return true
    }
  }

  return false
}

// Проверка пересечения для параллельных граней
const wouldIntersectIconsParallel = (p1, p2, bounds1, bounds2) => {
  const offset = 50

  if (p1.axis === 'vertical' && p2.axis === 'vertical') {
    // Путь: (p1.x, p1.z) -> (midX1, p1.z) -> (midX1, p2.z) -> (p2.x, p2.z)
    const dir1 = (p1.x === bounds1.x) ? -1 : 1
    const midX1 = p1.x + dir1 * offset

    // Проверяем первый горизонтальный сегмент (p1 -> midX1) на пересечение с bounds1
    const xMin1 = Math.min(p1.x, midX1)
    const xMax1 = Math.max(p1.x, midX1)
    if (p1.z > bounds1.z && p1.z < bounds1.z + bounds1.height &&
      xMin1 < bounds1.x + bounds1.width && xMax1 > bounds1.x) {
      return true
    }

    // Проверяем вертикальный сегмент (midX1, p1.z) -> (midX1, p2.z)
    const zMin = Math.min(p1.z, p2.z)
    const zMax = Math.max(p1.z, p2.z)
    if (midX1 > bounds1.x && midX1 < bounds1.x + bounds1.width &&
      zMin < bounds1.z + bounds1.height && zMax > bounds1.z) {
      return true
    }
    if (midX1 > bounds2.x && midX1 < bounds2.x + bounds2.width &&
      zMin < bounds2.z + bounds2.height && zMax > bounds2.z) {
      return true
    }

    // Проверяем второй горизонтальный сегмент (midX1, p2.z) -> (p2.x, p2.z)
    const xMin2 = Math.min(midX1, p2.x)
    const xMax2 = Math.max(midX1, p2.x)
    if (p2.z > bounds2.z && p2.z < bounds2.z + bounds2.height &&
      xMin2 < bounds2.x + bounds2.width && xMax2 > bounds2.x) {
      return true
    }
  }

  if (p1.axis === 'horizontal' && p2.axis === 'horizontal') {
    // Путь: (p1.x, p1.z) -> (p1.x, midZ1) -> (p2.x, midZ1) -> (p2.x, p2.z)
    const dir1 = (p1.z === bounds1.z) ? -1 : 1
    const midZ1 = p1.z + dir1 * offset

    // Проверяем первый вертикальный сегмент
    const zMin1 = Math.min(p1.z, midZ1)
    const zMax1 = Math.max(p1.z, midZ1)
    if (p1.x > bounds1.x && p1.x < bounds1.x + bounds1.width &&
      zMin1 < bounds1.z + bounds1.height && zMax1 > bounds1.z) {
      return true
    }

    // Проверяем горизонтальный сегмент
    const xMin = Math.min(p1.x, p2.x)
    const xMax = Math.max(p1.x, p2.x)
    if (midZ1 > bounds1.z && midZ1 < bounds1.z + bounds1.height &&
      xMin < bounds1.x + bounds1.width && xMax > bounds1.x) {
      return true
    }
    if (midZ1 > bounds2.z && midZ1 < bounds2.z + bounds2.height &&
      xMin < bounds2.x + bounds2.width && xMax > bounds2.x) {
      return true
    }

    // Проверяем второй вертикальный сегмент
    const zMin2 = Math.min(midZ1, p2.z)
    const zMax2 = Math.max(midZ1, p2.z)
    if (p2.x > bounds2.x && p2.x < bounds2.x + bounds2.width &&
      zMin2 < bounds2.z + bounds2.height && zMax2 > bounds2.z) {
      return true
    }
  }

  return false
}

const recalculateConnectionPoints = (connection) => {
  const startHoleId = connection.scheme_equipment_hole_start
  const endHoleId = connection.scheme_equipment_hole_end
  const startEq = getEquipmentByHoleId(startHoleId)
  const endEq = getEquipmentByHoleId(endHoleId)

  if (!startEq || !endEq) {
    connection.points = []
    return
  }

  const bounds1 = getEquipmentBounds(startEq)
  const bounds2 = getEquipmentBounds(endEq)

  const { point1, point2 } = getClosestEdgePoints(bounds1, bounds2)

  // Строим путь в зависимости от осей граней
  const axis1 = point1.axis
  const axis2 = point2.axis

  if (axis1 === axis2) {
    const offset = 50
    if (axis1 === 'vertical') {
      // Вертикальные грани – отступаем горизонтально наружу
      const dir1 = (point1.x === bounds1.x) ? -1 : 1
      const midX1 = point1.x + dir1 * offset

      connection.points = [
        { x: point1.x, z: point1.z, id: getId(), index: 0 },
        { x: midX1,   z: point1.z, id: getId(), index: 0 },
        { x: midX1,   z: point2.z, id: getId(), index: 0 },
        { x: point2.x, z: point2.z, id: getId(), index: 0 }
      ]
    } else {
      // Горизонтальные грани – отступаем вертикально наружу
      const dir1 = (point1.z === bounds1.z) ? -1 : 1
      const midZ1 = point1.z + dir1 * offset

      connection.points = [
        { x: point1.x, z: point1.z, id: getId(), index: 0 },
        { x: point1.x, z: midZ1,   id: getId(), index: 0 },
        { x: point2.x, z: midZ1,   id: getId(), index: 0 },
        { x: point2.x, z: point2.z, id: getId(), index: 0 }
      ]
    }
  } else {
    // Перпендикулярные грани - 1 излом (3 точки, нечетное количество -> перпендикулярные)
    if (axis1 === 'vertical' && axis2 === 'horizontal') {
      connection.points = [
        { x: point1.x, z: point1.z, id: getId(), index: 0 },
        { x: point2.x, z: point1.z, id: getId(), index: 0 },
        { x: point2.x, z: point2.z, id: getId(), index: 0 }
      ]
    } else {
      connection.points = [
        { x: point1.x, z: point1.z, id: getId(), index: 0 },
        { x: point1.x, z: point2.z, id: getId(), index: 0 },
        { x: point2.x, z: point2.z, id: getId(), index: 0 }
      ]
    }
  }
}

// Пересчёт всех соединений, связанных с оборудованием
const recalcConnectionsForEquipment = async (equipmentId) => {
  const eq = scheme.value.equipments.find(e => e.id === equipmentId)
  if (!eq) return

  const holeIds = eq.holes.map(h => h.id)

  for (const conn of scheme.value.connections) {
    if (holeIds.includes(conn.scheme_equipment_hole_start) ||
      holeIds.includes(conn.scheme_equipment_hole_end)) {
      recalculateConnectionPoints(conn)
    }
  }
}

const getEquipmentById = (id) => {
  for (let equipment of equipments.value) {
    if (equipment.id === id) {
      return equipment
    }
  }
  console.error('Ошибка поиска оборудования')
}

const getMaterialById = (id) => {
  for (let material of materials.value) {
    if (material.id === id) {
      return material
    }
  }
  console.error('Ошибка поиска материала')
}

const getHoleNameByEquipmentAndId = (equipmentId, id) => {
  for (let equipment of equipments.value) {
    if (equipment.id === equipmentId) {
      for (let hole of equipment.holes) {
        if (hole.id === id) {
          return hole.name
        }
      }
    }
  }
  console.error('Ошибка поиска отверстия')
}

const getNewEquipment = (equipment, material) => {
  return {
    id: getId(),
    material: material,
    equipment: equipment,
    x: 100,
    z: 100,
    holes: getEquipmentById(equipment).holes.map((item) => {
      return {
        id: getId(),
        hole: item.id,
        name: item.name
      }
    }),
    equipmentName: getEquipmentById(equipment).name,
    equipmentTypeName: getEquipmentById(equipment).type.name,
    materialName: getMaterialById(material).name,
    iconSrc: `${API_URL}${getEquipmentById(equipment).type.file}`,
  }
}

const openEditDeleteEquipmentDialog = (item) => {
  recalculateEditConnectionsForm(item.id)
  selectedEquipmentId.value = item.id
  selectedEquipment.value = item
  editDeleteEquipmentDialogOpened.value = true
}

const deleteEquipmentConnections = (id) => {
  let holesIds = scheme.value.equipments.filter(item => item.id === id)[0].holes.map((item) => item.id)
  scheme.value.connections = scheme.value.connections.filter((item) => {
    return !holesIds.includes(item.scheme_equipment_hole_start)
      && !holesIds.includes(item.scheme_equipment_hole_end)
  })
}

const deleteConnectionById = (id) => {
  scheme.value.connections = scheme.value.connections.filter(item => item.id !== id)
}

const deleteEquipmentById = (id) => {
  scheme.value.equipments = scheme.value.equipments.filter(item => item.id !== id)
}

const closeDeleteEquipmentDialog = () => {
  deleteEquipmentConnections(selectedEquipmentId.value)
  deleteEquipmentById(selectedEquipmentId.value)
  editDeleteEquipmentDialogOpened.value = false
}

const closeEditEquipmentDialog = (data) => {
  editDeleteEquipmentDialogOpened.value = false
  if (!data) return
  for (let i = 0; i < scheme.value.equipments.length; i++) {
    if (scheme.value.equipments[i].id === selectedEquipmentId.value) {
      if (scheme.value.equipments[i].material === data.material && scheme.value.equipments[i].equipment === data.equipment) {
        continue
      }
      deleteEquipmentConnections(selectedEquipmentId.value)
      scheme.value.equipments[i] = getNewEquipment(data.equipment, data.material)
    }
  }
}

const openAddEquipmentDialog = () => {
  addEquipmentDialogOpened.value = true
}

const closeAddEquipmentDialog = (data) => {
  addEquipmentDialogOpened.value = false
  if (!data) return
  scheme.value.equipments.push(getNewEquipment(data.equipment, data.material))
}

const openEditConnectionsDialog = (id) => {
  recalculateEditConnectionsForm(id)
  selectedEquipmentId.value = id
  editConnectionsDialogOpened.value = true
}

const closeEditConnectionsDialog = (data) => {
  editConnectionsDialogOpened.value = false
  if (!data) return
  for (const connection of data) {
    if (!connection.connection_id) {
      if (!connection.hole) continue
      const newConnection = {
        id: getId(),
        scheme_equipment_hole_start: connection.id,
        scheme_equipment_hole_end: connection.hole,
        material: connection.material,
        points: [],
        r: connection.r ? connection.r : 20.0,
      }
      scheme.value.connections.push(newConnection)
      recalculateConnectionPoints(newConnection)
      continue
    }
    const allowDelete = (!connection.hole && !connection.reverse) || (!connection.id && connection.reverse)
    if (allowDelete) {
      deleteConnectionById(connection.connection_id)
      continue
    }

    for (let i = 0; i < scheme.value.connections.length; i++) {
      if (scheme.value.connections[i].id !== connection.connection_id) continue
      scheme.value.connections[i].scheme_equipment_hole_start = connection.id
      scheme.value.connections[i].scheme_equipment_hole_end = connection.hole
      scheme.value.connections[i].material = connection.material
      scheme.value.connections[i].r = connection.r
      break
    }
  }
  recalcConnectionsForEquipment(selectedEquipmentId.value)
}

const loadSelectors = async () => {
  await selectorsStore.loadEquipments()
  await selectorsStore.loadMaterials()
}

const updateScheme = () => {
  store.updateScheme(Number(route.params.id), scheme.value)
}

// Функции редактора
const getCanvasCenter = () => {
  if (!canvasRef.value) return { x: 0, z: 0 }
  const rect = canvasRef.value.getBoundingClientRect()
  return { x: rect.width / 2, z: rect.height / 2 }
}

const startPan = (e) => {
  if (draggingEquipment.value) return
  isPanning.value = true
  panStart.value = { x: e.clientX, z: e.clientY }
  canvasRef.value.style.cursor = 'grabbing'
}

const onPan = (e) => {
  if (!isPanning.value) return

  const deltaX = e.clientX - panStart.value.x
  const deltaZ = e.clientY - panStart.value.z

  viewport.value.x += deltaX
  viewport.value.z += deltaZ

  panStart.value = { x: e.clientX, z: e.clientY }
}

const stopPan = () => {
  isPanning.value = false
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grab'
  }
}

const startDragEquipment = (e, equipment) => {
  e.stopPropagation()
  draggingEquipment.value = equipment

  const rect = canvasRef.value.getBoundingClientRect()

  // Позиция мыши относительно canvas
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // Позиция центра оборудования на экране
  const equipmentScreenX = equipment.x + viewport.value.x
  const equipmentScreenY = equipment.z + viewport.value.z

  // Смещение от центра оборудования до курсора
  dragOffset.value = {
    x: mouseX - equipmentScreenX,
    y: mouseY - equipmentScreenY
  }

  canvasRef.value.style.cursor = 'grabbing'
}

const onDragEquipment = (e) => {
  if (!draggingEquipment.value) return

  const rect = canvasRef.value.getBoundingClientRect()

  // Текущая позиция мыши относительно canvas
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // Новый центр оборудования = позиция мыши - смещение - сдвиг viewport
  const newX = mouseX - dragOffset.value.x - viewport.value.x
  const newZ = mouseY - dragOffset.value.y - viewport.value.z

  draggingEquipment.value.x = newX
  draggingEquipment.value.z = newZ
}

const stopDragEquipment = () => {
  if (draggingEquipment.value) {
    const movedEqId = draggingEquipment.value.id

    // Даем время на обновление позиции в DOM
    nextTick(() => {
      recalcConnectionsForEquipment(movedEqId)
    })

    draggingEquipment.value = null
  }
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grab'
  }
}

const getEditDataFromPreloadedScheme = () => {
  for (let schemeEquipment of preloadedScheme.value.equipments) {
    let newObj = {
      id: schemeEquipment.id,
      material: schemeEquipment.material,
      equipment: schemeEquipment.equipment,
      x: schemeEquipment.x,
      z: schemeEquipment.z,
      holes: schemeEquipment.holes.map((item) => {
        return {
          id: item.id,
          hole: item.hole,
          name: getHoleNameByEquipmentAndId(schemeEquipment.equipment, item.hole)
        }
      }),
      equipmentName: getEquipmentById(schemeEquipment.equipment).name,
      equipmentTypeName: getEquipmentById(schemeEquipment.equipment).type.name,
      materialName: getMaterialById(schemeEquipment.material).name,
      iconSrc: `${API_URL}${getEquipmentById(schemeEquipment.equipment).type.file}`,
    }
    scheme.value.equipments.push(newObj)
  }

  for (let schemeConnection of preloadedScheme.value.connections) {
    let newObj = {
      id: schemeConnection.id,
      material: schemeConnection.material,
      scheme_equipment_hole_start: schemeConnection.scheme_equipment_hole_start,
      scheme_equipment_hole_end: schemeConnection.scheme_equipment_hole_end,
      points: schemeConnection.points.map(point => point),
      r: schemeConnection.r
    }
    scheme.value.connections.push(newObj)
  }
}

const forceRecalculateAllBounds = async () => {
  await nextTick()
  // Принудительно пересчитываем все соединения
  for (const conn of scheme.value.connections) {
    recalculateConnectionPoints(conn)
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    await router.push('/')
    return
  }
  await loadSelectors()
  await store.loadScheme(Number(route.params.id))
  getEditDataFromPreloadedScheme()
  await nextTick()
  await forceRecalculateAllBounds()
  scheme.value.connections.forEach(conn => recalculateConnectionPoints(conn))

  // Настройка редактора
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grab'

    // Центрируем вид по первому оборудованию, если есть
    if (scheme.value.equipments.length > 0) {
      const center = getCanvasCenter()
      const equipmentWidth = 60
      const equipmentHeight = 60

      // Находим границы
      const bounds = scheme.value.equipments.reduce((acc, eq) => ({
        minX: Math.min(acc.minX, eq.x),
        minZ: Math.min(acc.minZ, eq.z),
        maxX: Math.max(acc.maxX, eq.x + equipmentWidth),
        maxZ: Math.max(acc.maxZ, eq.z + equipmentHeight)
      }), {
        minX: Infinity,
        minZ: Infinity,
        maxX: -Infinity,
        maxZ: -Infinity
      })

      // Центр группы
      const groupCenterX = (bounds.minX + bounds.maxX) / 2
      const groupCenterZ = (bounds.minZ + bounds.maxZ) / 2

      // Центрируем
      viewport.value.x = center.x - groupCenterX
      viewport.value.z = center.z - groupCenterZ
    }
  }

  window.addEventListener('resize', () => {
    forceRecalculateAllBounds()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    forceRecalculateAllBounds()
  })
})
</script>

<template>
  <v-row no-gutters style="height: 100%; background: #EEE">
    <v-col cols="12" style="height: 100px; border-bottom: 1px solid black; background: white; color: #1e1e1e;">
      <v-btn flat size="99" rounded="0" style="border-right: 1px solid black;" class="pa-1" @click="router.push('/schemes')" :disabled="loading || loadingUpdate">
        <v-row no-gutters>
          <v-col cols="12">
            <v-icon class="mr-2" size="30" color="red">mdi-backspace-outline</v-icon>
          </v-col>
          <v-col cols="12">
            <span style="color: #1e1e1e; text-transform: none; letter-spacing: 0; text-wrap: auto; font-size: 13px;">Вернуться к списку</span>
          </v-col>
        </v-row>
      </v-btn>
      <v-btn flat size="99" rounded="0" style="border-right: 1px solid black;" class="pa-1" @click="updateScheme" :disabled="loading || loadingUpdate">
        <v-row no-gutters>
          <v-col cols="12">
            <v-icon class="mr-2" size="30" color="green">mdi-content-save-check-outline</v-icon>
          </v-col>
          <v-col cols="12">
            <span style="color: #1e1e1e; text-transform: none; letter-spacing: 0; text-wrap: auto; font-size: 13px;">Сохранить изменения</span>
          </v-col>
        </v-row>
      </v-btn>
      <v-btn flat size="99" rounded="0" style="border-right: 1px solid black;" class="pa-1" @click="openAddEquipmentDialog" :disabled="loading || loadingUpdate">
        <v-row no-gutters>
          <v-col cols="12">
            <v-icon class="mr-2" size="30" color="blue">mdi-plus</v-icon>
          </v-col>
          <v-col cols="12">
            <span style="color: #1e1e1e; text-transform: none; letter-spacing: 0; text-wrap: auto; font-size: 13px;">Добавить оборудование</span>
          </v-col>
        </v-row>
      </v-btn>
    </v-col>
    <v-col cols="12" style="height: calc(100% - 100px); color: #1e1e1e; overflow: hidden; position: relative;">
      <div
        ref="canvasRef"
        class="editor-canvas"
        @mousedown="startPan"
        @mousemove="onPan"
        @mouseup="stopPan"
        @mouseleave="stopPan"
      >
        <svg
          v-if="scheme.equipments.length > 0 && !loadingUpdate && !loading"
          class="connections-layer"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"
        >
          <polyline
            v-for="conn in connectionsWithScreenPoints"
            :key="conn.id"
            :points="conn.screenPoints"
            fill="none"
            stroke="#2196F3"
            stroke-width="2"
          />
        </svg>
        <div
          v-if="scheme.equipments.length > 0 && !loadingUpdate && !loading"
          v-for="equipment in scheme.equipments"
          :key="equipment.id"
          :ref="el => { if (el) equipmentElements[equipment.id] = el }"
          class="equipment-item"
          :style="{
           transform: `translate(${equipment.x + viewport.x}px, ${equipment.z + viewport.z}px)`,
           cursor: draggingEquipment === equipment ? 'grabbing' : 'grab'
         }"
          @mousedown.stop="(e) => startDragEquipment(e, equipment)"
          @mousemove="onDragEquipment"
          @mouseup="stopDragEquipment"
          @click.prevent
          @dblclick.prevent="openEditConnectionsDialog(equipment.id)"
          @click.right.prevent.stop="openEditDeleteEquipmentDialog(equipment)"
          @contextmenu.prevent
        >
          <div class="equipment-icon" style="z-index: 1000">
            <img
              v-if="equipment.iconSrc"
              :src="equipment.iconSrc"
              alt="equipment"
              width="50"
              height="50"
              style="pointer-events: none;"
            />
            <v-icon v-else size="50" color="gray" style="pointer-events: none;">mdi-package-variant</v-icon>
          </div>
          <div class="equipment-info">
            <div class="equipment-name">{{ `${equipment.equipmentName} [${equipment.id}]` }}</div>
            <div class="equipment-type">{{ equipment.equipmentTypeName }}</div>
            <div class="equipment-material">{{ equipment.materialName }}</div>
          </div>
        </div>

        <div v-if="scheme.equipments.length === 0 || loadingUpdate || loading" class="empty-state">
          <v-icon size="64" color="gray">mdi-drawing</v-icon>
          <template v-if="!loading && !loadingUpdate">
            <p>Нет оборудования на схеме</p>
            <p class="hint">Нажмите "Добавить оборудование" чтобы начать</p>
          </template>
          <p v-else>Идёт загрузка...</p>
        </div>
      </div>
    </v-col>
    <add-equipment-dialog
      v-if="addEquipmentDialogOpened"
      :opened="addEquipmentDialogOpened"
      :equipments="equipments"
      :materials="materials"
      @close="closeAddEquipmentDialog"
      @apply="closeAddEquipmentDialog"
    />
    <edit-connections-dialog
      v-if="editConnectionsDialogOpened"
      :opened="editConnectionsDialogOpened"
      :connections="equipmentConnections"
      :equipment-holes="equipmentHoles"
      :outer-available-holes="outerAvailableHoles"
      :materials="materials"
      @close="closeEditConnectionsDialog"
      @apply="closeEditConnectionsDialog"
    />
    <edit-delete-equipment-dialog
      v-if="editDeleteEquipmentDialogOpened"
      :opened="editDeleteEquipmentDialogOpened"
      :materials="materials"
      :equipments="equipments"
      :item="selectedEquipment"
      @delete="closeDeleteEquipmentDialog"
      @close="closeEditEquipmentDialog"
      @apply="closeEditEquipmentDialog"
    />
  </v-row>
</template>

<style scoped lang="scss">
.editor-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  user-select: none;
}

// Слой с линиями (под оборудованием)
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; // Соединения на уровне 1
}

.equipment-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: transform 0.05s linear;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  z-index: 2; // Оборудование выше соединений

  &:active {
    cursor: grabbing;
  }
}

.equipment-icon {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #2196F3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
  position: relative;
  z-index: 3; // Иконка выше информационного блока

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-color: #1976D2;
  }

  img {
    pointer-events: none;
    object-fit: contain;
  }
}

.equipment-info {
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  border: 1px solid rgba(33, 150, 243, 0.3);
  margin-top: 2px;
  z-index: 2; // Информация над соединениями
}

.equipment-name {
  font-weight: bold;
  color: #1e1e1e;
  font-size: 12px;
}

.equipment-type {
  color: #666;
  font-size: 10px;
  margin-top: 2px;
}

.equipment-material {
  color: #2196F3;
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  z-index: 10;

  p {
    margin: 10px 0;
  }

  .hint {
    font-size: 12px;
    color: #bbb;
  }
}
</style>
