export interface DocFilterRequest {
  page: string,
  recordsOnPage: string,
  filter: Filter[],
}

export interface Filter {
  key: string,
  operation: string,
  value: string,
}

export interface FilterFieldsViewType {
  [id: number]: FilterFieldsType;
}

export interface DocType {
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

export interface SelectionType {
  id: number,
  name?: string,
  shortname?: string
}

export interface SelectableDataType {
  [key: string]: SelectionType[]
}

export type FilterDataType = {
  [key: string]: string | string[]
};
