import { Id, UserShortname } from '@/types';

export interface TaskDataType {
  author: UserShortname;
  content: string;
  createTime: string;
  heading: string;
  status: number;
  id?: number;
  subjects: Subject[];
  taskType: Id;
}

export interface Subject {
  date: string;
  id: number;
  name: string;
  number: string;
  subjectType: string;
}

export interface ExecutorInfo {
  comment: string;
  createdAt: string;
  dateOfCompletion: string;
  executor: UserShortname;
  id: number;
  planedDate: string;
  result: {
    resultName: string;
  };
  status: number;
}
