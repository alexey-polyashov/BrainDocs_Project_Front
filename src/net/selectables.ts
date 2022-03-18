import { NamedSelectionType } from '@/types';
import { computed, reactive, ref, Ref, shallowReactive, watch } from 'vue';
import {
  getSelectableArray,
  selectableTypes,
  SelectableTypesAlias,
} from './common-requests';

type CachedType = {
  [p in SelectableTypesAlias]?: {
    shouldSendRequest: boolean;
    data: Ref<NamedSelectionType[]>;
  };
};

const cached: CachedType = {};

export default function useSelectableArray(selectType: SelectableTypesAlias) {
  if (!cached[selectType]) {
    cached[selectType] = {
      shouldSendRequest: true,
      data: ref<NamedSelectionType[]>([]),
    };
  }
  const entry = cached[selectType] as NonNullable<
    typeof cached[SelectableTypesAlias]
  >;
  if (entry.shouldSendRequest) {
    entry.shouldSendRequest = false;
    getSelectableArray(selectType).then((data) => {
      entry.data.value = data;
    });
  }

  return entry.data;
}
