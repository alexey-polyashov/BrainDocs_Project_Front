import { FullFileType } from '../file-dialog/types';
import { IndexedType, NamedSelectionType } from '../../types';
import {
  DirectoryTypesAlias,
  SelectableTypesAlias,
} from '@/net/common-requests';

export interface DocFilterRequestType {
  page: string;
  recordsOnPage: string;
  filter: FilterType[];
}

export type ValidationRules = {
  callback: () => boolean;
  message: string;
  type?: string;
}[];

export interface FilterType {
  key: string;
  operation: string;
  value: string;
}

export interface DocumentView {
  id: number;
  documentType: string;
  documentDate: string;
  number: string;
  heading: string;
  responsible: string;
  author: string;
  organisation: string;
  files: string;
}

export interface FilterFieldsType {
  key: string;
  name: string;
  source: string;
  validOperations: string[];
  type: string;
  defaultOn: boolean;
  selectType: SelectableTypesAlias;
}

export interface UserResponseType {
  id: number;
  shortname: string;
}

export interface DocTypeView {
  name: string;
  id: number;
}

export interface OrganisationView {
  contacts: [];
  name: string;
  id: number;
  inn: string;
  kpp: string;
}

export interface SearchDefaultResponse {
  content: unknown[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: DocFilterResponsePageable;
  size: number;
  sort: DocFilterResponseSort;
  totalElements: number;
  totalPages: number;
}

export interface DocFilterResponse extends SearchDefaultResponse {
  content: DocFilterResponseContent[];
}

export interface DocTypeFilterResponse extends SearchDefaultResponse {
  content: DocTypeView[];
}

export interface DocFilterResponseContent {
  author: UserResponseType;
  content: string;
  documentDate: string;
  documentType: NamedSelectionType;
  files: FullFileType[];
  heading: string;
  id: number;
  marked: boolean;
  number: string;
  organisation: NamedSelectionType;
  responsible: UserResponseType;
}

export interface DocFilterResponsePageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: DocFilterResponseSort;
  unpaged: boolean;
}

export interface DocFilterResponseSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export type FilterFieldsViewType = IndexedType<number, FilterFieldsType>;

export type SelectableDataType = IndexedType<string, NamedSelectionType[]>;

export type FilterDataType = IndexedType<string, string>;
