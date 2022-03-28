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

export interface ExecutorInfoType {
  id: number;
  taskId: number;
  executor: UserShortname;
  createdAt: string;
  planedDate: string;
  dateOfCompletion: string;
  comment: string;
  result: ExecutionResultType;
  status: number;
}

export interface ExecutionResultType {
  id: number;
  resultName: string;
  resultType: number;
}
