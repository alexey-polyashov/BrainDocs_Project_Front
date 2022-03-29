import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import {
  FileDescriptionType,
  FullFileType,
} from '../components/file-dialog/types';
import router from '../router';
import { useStore } from '../store';
import { IndexedType, NamedSelectionType, UserInfoType } from '../types';

export async function uploadFileToExistingElement(
  elemType: DirectoryTypesAlias,
  elemId: number,
  fileInfo: FileDescriptionType
) {
  const store = useStore();
  // replace name property with shortname as it is required for dto
  fileInfo.author.id = store.getUserInfo.authorized
    ? (store.getUserInfo.userExtra?.id as number)
    : 1;
  const fileIdToSave = fileInfo.id;
  delete fileInfo.id;
  delete (fileInfo as any).localId;
  const formData = new FormData();
  formData.append(
    'fileDescribe',
    JSON.stringify(fileInfo, (key, value) => {
      if (key === 'fileRaw') {
        return undefined;
      }
      return value;
    })
  );
  if (fileInfo.fileRaw) formData.append('file', fileInfo.fileRaw);
  return new Promise<FullFileType>((resolve, reject) => {
    axios
      .post<FullFileType>(
        `/${getUrlByDirectoryType(elemType)}/${elemId}/files/${
          fileIdToSave !== undefined ? fileIdToSave : 'upload'
        }`,
        formData
      )
      .then((res) => resolve(res.data))
      .catch((err) => {
        if (err.response) {
          console.error(err.response.data);
        }
        ElMessage.error('Error');
        reject(err);
      });
  });
}

export const selectableTypes = Object.freeze({
  contactTypes: 'contacts/types',
  users: 'users',
  docTypes: 'documents/types',
  orgs: 'organisations',
  taskTypes: 'tasks/types',
  taskStatuses: 'tasks/statuses/names',
});

export type SelectableTypesAlias = keyof typeof selectableTypes;

export const directoryTypes = Object.freeze({
  docTypes: 'documents/types',
  orgs: 'organisations',
  docs: 'documents',
  tasks: 'tasks',
  taskExecutors: 'tasks/executors',
} as const);

export type DirectoryTypesAlias = keyof typeof directoryTypes;
export type DirectoryTypesValues = typeof directoryTypes[DirectoryTypesAlias];

export function getUrlByDirectoryType(type: DirectoryTypesAlias) {
  return directoryTypes[type];
}

export async function getSelectableArray(
  type: SelectableTypesAlias
): Promise<NamedSelectionType[]> {
  return new Promise<NamedSelectionType[]>((resolve, reject) => {
    axios
      .get<(NamedSelectionType & { shortname?: string })[]>(
        selectableTypes[type]
      )
      .then((res) => {
        res.data.forEach((element, index, array) => {
          if (element.shortname) {
            array[index].name = element.shortname;
          }
        });
        resolve(res.data);
      })
      .catch((err) => {
        console.error(err.response.message);
        reject(err);
      });
  });
}

export async function updateUserData() {
  return axios.get<UserInfoType>('/users/authorized').then((res) => {
    useStore().$state.userInfo.userExtra = res.data;
  });
}

export const taskExecutorStatuses = ref<IndexedType<number, string>>({});
export const taskStatuses = ref<IndexedType<number, string>>({});

export async function getTaskExecutorStatuses() {
  await axios.get('tasks/executors/statuses').then((res) => {
    taskExecutorStatuses.value = res.data;
  });
  return taskExecutorStatuses;
}

export async function getTaskStatuses() {
  await axios.get('tasks/statuses').then((res) => {
    taskStatuses.value = res.data;
  });
  return taskStatuses;
}
