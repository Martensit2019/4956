<template>
  <div
class="assembly-object-table no-drag" :style="{
    height: props.resizeHeightTable
      ? props.resizeHeightTable - 135 + 'px'
      : props.initialHeight
        ? props.initialHeight
        : '196px',
  }">
    <div ref="table" class="assembly-object-table__table">
      <V2Table v-if="tableData.length" :id="tableId" class="table_base">
        <V2TableHead class="table_base__thead">
          <V2TableRow class="table_base__tr-heading">
            <V2TableCol
is="th" v-for="(head, index) in props.headers" :id="`${tableId}_th_${index}`" :key="index + 'th'"
              :ref="(el: any) => {
                refStorage[head.code] = el as HTMLTableElement
              }
                " :width="colsWidth[index]" class="table_base__th-heading" style="position: relative">
              <div class="cell">
                <span>{{ head.name }}</span>
              </div>
              <div
class="resizer" :style="{ height: tableData.length ? heightTable : '50px' }"
                @mousedown="startResize($event, index)"></div>
            </V2TableCol>
          </V2TableRow>
        </V2TableHead>
        <V2TableBody
v-for="(parametr, index) in tableData" :key="index" class="table_base__body" :draggable="isDraggable"
          :data-index="index" @dragstart="dragStart" @dragover.prevent @dragenter.prevent @drop="dragDrop">
          <AssembliesObjectTableRow
:data="parametr" :table-id="tableId" :expand="expand" :headers="headers"
            :index="index" :are-icons-blue="areIconsBlue" :are-icons-small="areIconsSmall" @delete-row="onDeleteClick"
            @delete-child-row="onDeleteChildRow" @change-row="emits('change-row')" @update-row="updateRow" />
        </V2TableBody>
      </V2Table>
      <div v-else class="assembly-object-table__default">нет данных</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ITableData } from '@/components/library/LibraryRegistry/interfaceLibraryRegistry'
import {
  IHeaders,
  IRefStore,
} from '@/components/library/libraryComponents/interfaceLibraryComponents'
import { IObject } from '@/components/common/interfaceCommon'

interface IProps {
  tableId: string
  headers: IHeaders[]
  rowTable: ITableData[]
  expand?: boolean
  areIconsBlue?: boolean
  areIconsSmall?: boolean
  resizeHeightTable?: number | null
  initialHeight?: string
  isHideDelete?: boolean
  isDraggable?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  expand: false,
  isDraggable: true,
})

const emits = defineEmits<IEmits>()

interface IEmits {
  (e: 'delete-row', row: IObject): void
  (e: 'deleteChildRow', row: IObject, parentCode: string): void
  (e: 'change-row'): void
  (e: 'update-row', row: IObject): void
}
const refStorage = reactive<IRefStore>({
  code: null,
  name: null,
  unit: null,
  attrs: null,
  params: null,
  actions: null,
})

const table = ref<HTMLTableElement>()

const tableData = ref<ITableData[]>([])

const colsWidth = ref([
  'auto',
  'auto',
  'auto',
  'auto',
  'auto',
  'auto',
  'auto',
  'auto',
  'auto',
])

const heightTable = ref<string>('0')

const onDeleteClick = (row: IObject) => {
  emits('delete-row', row)
}

const onDeleteChildRow = (row: IObject, parentCode: string) => {
  emits('deleteChildRow', row, parentCode)
}

// ESLINT-DISABLE: Старая реализация
// eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
const dragStart = (e: any) => {
  e.dataTransfer.dropEffect = 'move'
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('itemID', e.currentTarget.dataset.index)

}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dragDrop = (e: any): void => {
  e.stopPropagation()
  e.preventDefault()
  const itemIndex = e.dataTransfer?.getData('itemID')
  const droppedIndex = e.currentTarget.dataset.index
  changeTable(itemIndex, droppedIndex)
}

const changeTable = (itemIndex: number, droppedIndex: number) => {
  const movedItem = tableData.value[itemIndex]
  tableData.value.splice(itemIndex, 1)
  tableData.value.splice(droppedIndex, 0, movedItem)
}
const updateRow = (row: IObject) => {
  emits('update-row', row)
}
watch(
  () => props.rowTable,
  (value) => {
    tableData.value = value
    setTimeout(() => {
      heightTable.value = `${table?.value?.offsetHeight}px`
      setWidthCols()
    }, 0)

  }
)

const x = ref(0)
const widthCurrentColumn = ref(0)
const newWidthCurrentColumn = ref(0)
const currentColumn = ref()
const currentColumnIdx = ref<number>(0)

const setWidthCols = () => {
  const initialCol = colsWidth.value.map((col: string, idx: number) => {
    const curCol = document.querySelector(`#${props.tableId}-table-${props.tableId}_th_${idx.toString()}-th`)
    return `${(curCol as HTMLElement).offsetWidth}px`
  })
  const table1 = document.querySelector('#scope_work_structure_table-table')
  ;(table1 as HTMLTableElement).style.width = 'auto'
  colsWidth.value = [...initialCol]
}

const startResize = (e: MouseEvent, idx: number) => {

  currentColumnIdx.value = idx
  x.value = 0

  currentColumn.value = document.querySelector(
    `#${props.tableId}-table-${props.tableId}_th_${idx.toString()}-th`
  )
  if (currentColumn.value) {
    widthCurrentColumn.value = (currentColumn.value as HTMLElement).offsetWidth
  }
  x.value = 0
  x.value = e.clientX

  document.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mouseup', mouseUpHandler)
}

const mouseMoveHandler = function (e: MouseEvent) {
  const dx = e.clientX - x.value
  newWidthCurrentColumn.value = widthCurrentColumn.value + dx
  colsWidth.value[currentColumnIdx.value] = newWidthCurrentColumn.value + 'px'

}

const mouseUpHandler = function () {
  document.removeEventListener('mousemove', mouseMoveHandler)
  document.removeEventListener('mouseup', mouseUpHandler)
}

onMounted(() => {
  document.removeEventListener('mouseup', mouseUpHandler)
})
</script>

<style scoped lang="sass">
  @import "scopeWorkStructureTable"
</style>
