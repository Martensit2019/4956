import { Http } from '@/helpers'
import {
  ITreeItemNormativLeafResponse,
  INormativTreeRootNormativResource,
  INormativTreeChild,
  INormativTreeRoot,
  INormativWork,
} from './types'

const servicePath = 'normativ-data'

export const getFileResourcesRequest = (periodId: number, fileName?: string) =>
  Http.get<
    INormativTreeChild | INormativTreeRoot | ITreeItemNormativLeafResponse
  >(
    `${servicePath}/trees_resource/files/${periodId}${
      fileName ? `/${fileName}` : ''
    }`
  )

export const getFileWorksRequest = (periodId: number, fileName?: string) =>
  Http.get<
    INormativTreeChild | INormativTreeRoot | ITreeItemNormativLeafResponse
  >(
    `${servicePath}/trees_work/files/${periodId}${
      fileName ? `/${fileName}` : ''
    }`
  )

export const getWorkRequest = (workId: number) =>
  Http.get<INormativWork>(`${servicePath}/works/${workId}`)

export const getResourceRequest = (
  resourceId: INormativTreeRootNormativResource['id']
) =>
  Http.get<INormativTreeRootNormativResource>(
    `${servicePath}/resources/${resourceId}`
  )

export const generateTreesWorkRequest = () =>
  Http.get(`${servicePath}/trees_work/generate`)

export const generateTreesResourceRequest = () =>
  Http.get(`${servicePath}/trees_resource/generate`)

interface INormativTreeSearch {
  normativ_period_id: number
  search_text: string
  fields: string
  area: string
}

export const getNormativeSearch = (payload: INormativTreeSearch) =>
  Http.get(`${servicePath}/trees_all/search`, {
    params: { ...payload },
  })


  // D:\ursip\frontend\niac\src\api\normativData\api.ts