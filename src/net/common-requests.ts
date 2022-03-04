import axios from 'axios';
import { ElMessage } from 'element-plus';
import {
  FileDescriptionType,
  FullFileType,
} from '../components/file-dialog/types';
import { NamedSelectionType } from '../types';

export async function uploadFileToExistingDocument(
  docId: number,
  fileInfo: FileDescriptionType
) {
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
        `/documents/${docId}/files/${
          fileInfo.id !== undefined ? fileInfo.id : 'upload'
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
