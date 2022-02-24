import { FileType } from "../file-dialog/types";

export type IndexedType<T extends number | string, U> = {
  [id in T]: U;
};

export interface DocFilterRequestType {
  page: string,
  recordsOnPage: string,
  filter: FilterType[],
}

export interface FilterType {
  key: string,
  operation: string,
  value: string,
}

export interface DocTypeView {
  id: number,
  documentType: string,
  documentDate: string,
  number: string,
  heading: string,
  responsible: string,
  author: string,
  organisation: string,
  files: string,
}

export interface FilterFieldsType {
  readonly key: string,
  name: string,
  source: string,
  validOperations: string[],
  type: string,
  defaultOn: boolean,
}

export interface NamedSelectionType {
  id: number,
  name?: string,
  shortname?: string
}

export interface DocFilterResponse {
  content: DocFilterResponseContent[];
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

export interface DocFilterResponseContent {
  author: NamedSelectionType;
  content: string;
  documentDate: string;
  documentType: DocumentType;
  files: FileType[];
  heading: string;
  id: number;
  marked: boolean;
  number: string;
  organisation: DocumentType;
  responsible: NamedSelectionType;
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
