import { NamedSelectionType } from '@/types';
import { computed, reactive, ref, Ref, shallowReactive, watch } from 'vue';
import {
  getSelectableArray,
  selectableTypes,
  SelectableTypesAlias,
} from './common-requests';

type CachedType = {
  [p in SelectableTypesAlias]?: {
    ready: boolean;
    pending: boolean;
    data: Ref<NamedSelectionType[]>;
  };
};

const cached: CachedType = {};

export default function useSelectableArray(selectType: SelectableTypesAlias) {
  if (!cached[selectType]) {
    cached[selectType] = {
      ready: false,
      pending: false,
      data: ref<NamedSelectionType[]>([]),
    };
  }
  const entry = cached[selectType] as NonNullable<
    typeof cached[SelectableTypesAlias]
  >;
  if (!entry.pending && !entry.ready) {
    entry.pending = true;
    getSelectableArray(selectType).then((data) => {
      entry.ready = true;
      entry.pending = false;
      entry.data.value = data;
    });
  }

  return entry.data;
}
