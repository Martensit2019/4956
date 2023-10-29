<template>
  <V2Modal
    v-model:show="showModal"
    title="Добавить новый шаг"
    size="lg"
    class="administration-check-list-test-psm-modal-add"
  >
    <div>
      <V2FormItem :error="errors.name?.firstMessage">
        <V2Label id="modal-add-name-label" for="modal-add-name-input"
          >Название</V2Label
        >

        <V2Input id="modal-add-name-input" v-model="validateData.name.value" />

        <template #helperText>
          Помните, что формулировка шага <br />
          должна подразумевать возможность ответов “Да” и “Нет”
        </template>
      </V2FormItem>
      <div v-if="idEmptyCheckListItems">
        <V2FormItem>
          <V2Label id="is-element-other-step-label"
            >Является элементом другого шага</V2Label
          >

          <V2RadioItem
            id="is-element-other-step-no"
            v-model="validateData.isElementOtherStep.value"
            label="Нет"
            name="isElementOtherStep"
            value="no"
          />
          <V2RadioItem
            id="is-element-other-step-yes"
            v-model="validateData.isElementOtherStep.value"
            label="Да"
            name="isElementOtherStep"
            value="yes"
          />
        </V2FormItem>
        <V2FormItem
          v-if="validateData.isElementOtherStep.value === 'yes'"
          :error="nameStepErrors.nameStep?.firstMessage"
        >
          <V2Label
            id="modal-add-name-step-label"
            for="modal-add-name-step-select"
            >Наименование шага</V2Label
          >

          <V2Select
            id="modal-add-name-step-select"
            v-model="nameStepData.nameStep.value"
            :options="nextStepsOptions"
            :is-loading-options="isLoadingCheckList"
            @open="onOpenCheckListSelect"
          />
        </V2FormItem>
        <V2FormItem
          v-if="showNextStepSelect"
          :error="nameStepOtherErrors.nextStep?.firstMessage"
        >
          <V2Label
            id="modal-add-name-next-step-label"
            for="modal-add-name-next-step-select"
            >После какого шага должен идти новый шаг</V2Label
          >

          <!--
          Поле ввода с раскрывающимся списком “После какого шага должен идти новый шаг“, обязательное поле при выбранном ДА в “Является элементом другого шага“
          Если выбрано ДА в “Является элементом другого шага“ в список выводить только наименования шагов с тем же parent_id что и у выбранного в “Наименование шага“.
          Если выбрано НЕТ в “Является элементом другого шага“ в список выводить только наименования шагов где нет parent_id
          -Текст “Используем внешнее ПО”
         -->

          <V2Select
            id="modal-add-name-next-step-select"
            v-model="nameStepOtherData.nextStep.value"
            v-model:search="search"
            :options="otherElementsItemsOptions"
            :is-loading-options="isLoadingCheckList"
            @open="onOpenCheckListSelect"
          />
        </V2FormItem>
      </div>

      <V2FormItem>
        <V2Label id="modal-external-po-label">Используем внешнее ПО</V2Label>

        <V2RadioItem
          id="has-external-po-no"
          v-model="validateData.isHasExternalPo.value"
          label="Нет"
          name="externalPo"
          value="no"
        />
        <V2RadioItem
          id="has-external-po-yes"
          v-model="validateData.isHasExternalPo.value"
          label="Да"
          name="externalPo"
          value="yes"
        />
      </V2FormItem>

      <V2FormItem
        v-if="validateData.isHasExternalPo.value === 'yes'"
        :error="typePoErrors.isHasExternalPo?.firstMessage"
      >
        <V2Label
          id="modal-external-po-type-label"
          for="modal-external-po-type-input"
          >Используем внешнее ПО</V2Label
        >

        <V2Select
          id="modal-external-po-type-select"
          v-model="typePoData.typePo.value"
          :options="[
            { value: 'build_bim_system', label: 'BIM-программы' },
            { value: 'build_estimating_system', label: 'Сметные программы' },
          ]"
        />
      </V2FormItem>

      <V2FormItem :error="errors.comment?.firstMessage">
        <V2Label
          id="modal-external-comment-label"
          for="modal-external-comment-input"
          >Комментарий</V2Label
        >

        <V2Textarea
          id="modal-external-textarea-comment"
          v-model="validateData.comment.value"
          size="sm"
        />
      </V2FormItem>
    </div>
    <template #footer>
      <div class="d-flex items-center">
        <Button
          id="adm-modal-add-save-btn"
          view="fill"
          text="Сохранить"
          class="administration-check-list-test-psm-modal-add__save-btn"
          @click="onSubmit"
        />
        <Button
          id="adm-modal-add-cancel-btn"
          view="ghost"
          text="Отмена"
          class="administration-check-list-test-psm-modal-add__cancel-btn"
          @click="onCancelClickBtn"
        />
      </div>
    </template>
  </V2Modal>
</template>

<script setup lang="ts">
  import {
    addCheckListItemRequest,
    getCheckListRequest,
    ICheckListItem,
  } from '@/api'
  import { useReactiveValidator } from '@/composables/reactiveValidator'
  import { usePeriodStore } from '@/stores/period'

  interface IProps {
    show: boolean
    idEmptyCheckListItems: boolean
  }

  interface IEmits {
    (e: 'update:show', val: boolean): void
    (e: 'added'): void
  }

  const props = defineProps<IProps>()

  const emit = defineEmits<IEmits>()

  const periodsStore = usePeriodStore()

  const { periodId } = storeToRefs(periodsStore)

  const showModal = computed({
    get: () => props.show,
    set: (val) => emit('update:show', val),
  })

  const { validateData, errors, validate, clearErrors } = useReactiveValidator({
    name: {
      name: 'name',
      rules: ['required', 'max_length'],
      value: '',
      ru: 'название',
      params: { maxLength: 255 },
    },
    isElementOtherStep: {
      name: 'isElementOtherStep',
      rules: [],
      value: 'no',
      ru: '',
    },
    isHasExternalPo: {
      name: 'isHasExternalPo',
      rules: [],
      ru: '',
      value: 'no',
    },
    comment: {
      name: 'comment',
      rules: ['required', 'max_length'],
      value: '',
      ru: 'комментарий',
      params: { maxLength: 255 },
    },
  })

  const {
    validateData: nameStepOtherData,
    errors: nameStepOtherErrors,
    validate: nameStepOtherValidate,
    clearErrors: nameStepOtherClearErrors,
  } = useReactiveValidator({
    nextStep: {
      name: 'nextStep',
      rules: [{ name: 'required', message: 'Выберите шаг' }],
      value: '',
      ru: 'следующий шаг',
    },
  })

  const {
    validateData: nameStepData,
    errors: nameStepErrors,
    validate: nameStepValidate,
    clearErrors: nameStepClearErrors,
  } = useReactiveValidator({
    nameStep: {
      name: 'nameStep',
      rules: ['required', 'max_length'],
      value: '',
      ru: 'наименование шага',
      params: { maxLength: 255 },
    },
  })

  const {
    validateData: typePoData,
    errors: typePoErrors,
    validate: typePoValidate,
    clearErrors: typePoClearErrors,
  } = useReactiveValidator({
    typePo: {
      name: 'typePo',
      rules: ['required'],
      value: '',
      ru: 'тип по',
    },
  })

  const isLoadingCheckList = ref(false)

  const search = ref<string>('')

  const elementHasOtherStep = computed(
    () => validateData.value.isElementOtherStep.value,
  )

  const isOtherStep = computed(
    () => validateData.value.isElementOtherStep.value === 'yes',
  )

  const checkListItems = ref<ICheckListItem[]>([])

  const selectedParentStep = computed(() =>
    checkListItems.value.find(
      (item) => item.id === nameStepData.value.nameStep.value,
    ),
  )

  const selectedNextStep = computed(() =>
    checkListItems.value.find(
      ({ id }) => id === nameStepOtherData.value.nextStep.value,
    ),
  )

  const nextStepsOptions = computed(() =>
    checkListItems.value.map(({ id, name }) => ({
      value: id,
      label: name,
    })),
  )

  const showNextStepSelect = computed(
    () =>
      validateData.value.isElementOtherStep.value === 'no' ||
      checkListItems.value.filter(
        ({ parent_id }) => parent_id === selectedParentStep.value?.id,
      ).length,
  )

  const otherElementsItemsOptions = computed(() =>
    (isOtherStep.value
      ? checkListItems.value.filter(
          ({ parent_id }) => parent_id === selectedParentStep.value?.id,
        )
      : checkListItems.value.filter(({ parent_id }) => !parent_id)
    ).map(({ id, name }) => ({
      value: id,
      label: name,
    })),
  )

  function getCheckListSteps() {
    if (!periodId.value) {
      return
    }

    isLoadingCheckList.value = true

    getCheckListRequest(periodId.value)
      .then(({ data }) => {
        checkListItems.value = data.results.map((item: ICheckListItem) => ({
          ...item,
          name: `${item.number} ${item.name}`,
        }))
      })
      .finally(() => {
        isLoadingCheckList.value = false
      })
  }

  function onOpenCheckListSelect() {
    if (isLoadingCheckList.value || !!checkListItems.value.length) {
      return
    }

    getCheckListSteps()
  }

  function resetForm() {
    validateData.value.isElementOtherStep.value = 'no'
    validateData.value.isHasExternalPo.value = 'no'
    validateData.value.name.value = ''
    validateData.value.comment.value = ''
    nameStepOtherData.value.nextStep.value = ''

    nameStepData.value.nameStep.value = ''

    typePoData.value.typePo.value = ''

    nextTick().then(() => {
      clearErrors()
      nameStepClearErrors()
      typePoClearErrors()
      nameStepOtherClearErrors()
    })
  }

  function getNumberAdd() {
    console.log('selectedParentStep.value', selectedParentStep.value);
    console.log('selectedNextStep.value', selectedNextStep.value);
    
    
    if (elementHasOtherStep.value === 'yes') {
      if (selectedParentStep.value?.parent_id) {
        console.log('selectedParentStep.value?.number -->', selectedParentStep.value.number);
        const selectedParentStepNumber = selectedParentStep.value.number
        console.log('selectedParentStepNumber -->', selectedParentStepNumber);
        const arr = selectedParentStepNumber.toString().split('.')
        const firstPartNumberParent = arr[0]
        const secondPartNumberParent = arr[1]
        console.log('arr', arr);
        if(secondPartNumberParent){
          const secondPartNumber = (+secondPartNumberParent + 1).toString()
          console.log('secondPartNumber', secondPartNumber);
          return Number(`${firstPartNumberParent},${secondPartNumber}`)
        }
//         }else{
// console.log('55');

//         }

        
        
        
        return Number(selectedNextStep.value?.number) + 1 || 1
      }
      return 1
    }

    return Number(selectedNextStep.value?.number) + 1 || 1
  }

  function onCancelClickBtn() {
    showModal.value = false
  }

  async function onSubmit() {
    if (!periodId.value) {
      return
    }

    const dataValidated = validate()
    let nameStepValidated = true
    let typePoValidated = true
    let nextStepValidated = true

    const isHasPo = validateData.value.isHasExternalPo.value === 'yes'
    const isHasElementOtherStep =
      validateData.value.isElementOtherStep.value === 'yes'

    if (showNextStepSelect.value) {
      nextStepValidated = props.idEmptyCheckListItems
        ? nameStepOtherValidate()
        : true
    }

    if (isHasElementOtherStep) {
      nameStepValidated = nameStepValidate()
    }

    if (isHasPo) {
      typePoValidated = typePoValidate()
    }
// -----------------------
    const name= validateData.value.name.value
    const number= getNumberAdd()
    const comment= validateData.value.comment.value
    const external_software= isHasPo ? typePoData.value.typePo.value : null
    const parent_id= nameStepData.value.nameStep.value || null
    console.log('name -->', name)
    console.log('number -->', number)
    console.log('comment -->', comment)
    console.log('external_software -->', external_software)
    console.log('parent_id -->', parent_id)
    
// -----------------------
    

    if (
      dataValidated &&
      nameStepValidated &&
      typePoValidated &&
      nextStepValidated
    ) {
      addCheckListItemRequest(
        {
          name: validateData.value.name.value,
          number: getNumberAdd(),
          comment: validateData.value.comment.value,
          external_software: isHasPo ? typePoData.value.typePo.value : null,
          parent_id: nameStepData.value.nameStep.value || null,
        },
        periodId.value,
      ).then(() => {
        emit('added')
        getCheckListSteps()
      })
    }
  }

  watch(showModal, (val) => {
    if (val) {
      resetForm()
    }
  })

  watch(elementHasOtherStep, () => {
    nameStepOtherData.value.nextStep.value = ''
    nameStepData.value.nameStep.value = ''

    nameStepOtherClearErrors()
    nameStepClearErrors()
  })

  watch(
    validateData,
    (val) => {
      if (val.isElementOtherStep.value === 'no') {
        nameStepData.value.nameStep.value = ''
        nameStepClearErrors()
      }

      if (val.isHasExternalPo.value === 'no') {
        typePoData.value.typePo.value = ''
        typePoClearErrors()
      }
    },
    {
      deep: true,
    },
  )
</script>

<style lang="sass" scoped>
  @import './administrationCheckListTestPsmModalAdd'
</style>
