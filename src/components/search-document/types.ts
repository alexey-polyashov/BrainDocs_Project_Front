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

export type FilterFieldsViewType = IndexedType<number, FilterFieldsType>;

export type SelectableDataType = IndexedType<string, SelectionType[]>;

export type FilterDataType = IndexedType<string, string | string[]>;
