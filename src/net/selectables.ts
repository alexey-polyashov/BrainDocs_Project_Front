import { NamedSelectionType, Vref } from '@/types';
import { computed, ComputedRef, reactive, ref, Ref, watch } from 'vue';
import { getSelectableArray, SelectableTypesAlias } from './common-requests';

const cached = reactive<{
  [p in SelectableTypesAlias]?: {
    pending?: boolean;
    data?: NamedSelectionType[];
  };
}>({});

export default async function useSelectableArray(
  selectType: SelectableTypesAlias,
  waitForResultIfStartedAlready = true
) {
  return new Promise<NamedSelectionType[]>((resolve, reject) => {
    if (cached[selectType]?.data) {
      resolve(cached[selectType]?.data as any);
    } else if (!cached[selectType]?.pending) {
      cached[selectType] = {
        pending: true,
      };
      getSelectableArray(selectType)
        .then((data) => {
          cached[selectType] = {
            data,
            pending: false,
          };
          resolve(data);
        })
        .catch((err) => reject(err));
    } else if (waitForResultIfStartedAlready) {
      const watchStopHandle = watch(
        () => cached[selectType],
        (newVal, oldVal) => {
          if (newVal?.pending === false && newVal.data) {
            resolve(newVal.data);
            watchStopHandle();
          }
        }
      );
    } else {
      resolve([]);
    }
  });
}
