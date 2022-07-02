import { watch } from 'vue';
import { keysOf } from '@/utils';

import type { WatchCallback } from 'vue';

export const watchReactiveObjectKeys = <ObjectType extends Record<string, unknown>>(
  object: ObjectType,
  callback: WatchCallback,
) => watch(keysOf(object).map((key) => () => object[key]), callback);
