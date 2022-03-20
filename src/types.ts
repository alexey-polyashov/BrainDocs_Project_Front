export type IndexedType<T extends number | string, U> = {
  [id in T]: U;
};

export type IndexedStrType<T> = {
  [id: string]: T;
};

export interface Id {
  id: number;
}

export interface UserShortname {
  id: number;
  shortname: string;
}

export interface NamedSelectionType {
  [p: string]: string | number;
  id: number;
  name: string;
}

export interface UserInfoType {
  birthday: string;
  confirmed: boolean;
  contacts: Contact[];
  email: string;
  fullname: string;
  id: number;
  login: string;
  male: string;
  marked: boolean;
  organisation: NamedSelectionType;
  roles: NamedSelectionType[];
  shortname: string;
}

export interface Contact {
  id: number;
  marked: boolean;
  present: string;
  typeId: number;
  typeName: string;
  userId: number;
  userName: string;
}
