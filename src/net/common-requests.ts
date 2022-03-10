import axios from 'axios';
import { ElMessage } from 'element-plus';
import {
  FileDescriptionType,
  FullFileType,
} from '../components/file-dialog/types';
import router from '../router';
import { useStore } from '../store';
import { NamedSelectionType, UserInfoType } from '../types';

export async function uploadFileToExistingElement(
  elemType: DirectoryTypesAlias,
  elemId: number,
  fileInfo: FileDescriptionType
) {
  // replace name property with shortname as it is required for dto
  if (fileInfo.author) {
    const author = fileInfo.author as any;
    author.shortname = author.name;
    delete author.name;
  }
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
  users: 'users',
  docTypes: 'documents/types',
  orgs: 'organisations',
});

export type SelectableTypesAlias = keyof typeof selectableTypes;

export const directoryTypes = Object.freeze({
  docTypes: 'documents/types',
  orgs: 'organisations',
  docs: 'documents',
});

export type DirectoryTypesAlias = keyof typeof directoryTypes;

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
  return axios
    .get<UserInfoType>('/users/authorized')
    .then((res) => {
      useStore().$state.userInfo.userExtra = res.data;
    })
    .catch((err) => {
      ElMessage.warning('Произошла ошибка');
    });
}
