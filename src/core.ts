import {
  computed, ref, shallowRef, watch,
} from 'vue';
import { watchReactiveObjectKeys } from '@/watchers';

import type { Ref } from 'vue';
import type { ComposableCreationOptions } from '@/types/composableCreation';
import type { PageRelatedRequestOptions, PaginatedRequestMethod } from '@/types/requests';

export const createPaginatedResourceComposable = <
  PageKeyType extends string = 'page',
  PageSizeKeyType extends string | undefined = undefined,
>(composableOptions: ComposableCreationOptions<PageKeyType, PageSizeKeyType>) => {
  const FRONTEND_PAGE_SIZE = composableOptions.frontend.pageSize;
  const BACKEND_PAGE_SIZE = composableOptions.backend?.pageSize;
  const BACKEND_PAGE_REQUEST_KEY = composableOptions.backend?.requestKeys?.page || 'page';
  const BACKEND_PAGE_SIZE_REQUEST_KEY = composableOptions.backend?.requestKeys?.pageSize;

  return <ElementType, OptionsType extends PageRelatedRequestOptions<PageKeyType, PageSizeKeyType>>(
    paginatedRequestMethod: PaginatedRequestMethod<ElementType, OptionsType>,
    page: Ref<number>,
    resetPage: () => void,
    requestOptions: Omit<
      OptionsType,
      keyof PageRelatedRequestOptions<PageKeyType, PageSizeKeyType>
    >,
  ) => {
    const elements = shallowRef<Array<ElementType>>([]);
    const loading = ref(false);
    const total = ref(0);
    const backendPage = ref(0);

    const firstElement = computed(
      () => FRONTEND_PAGE_SIZE * (page.value - 1),
    );
    const nextElement = computed(() => FRONTEND_PAGE_SIZE * page.value);
    const remainingElements = computed(() => elements.value.length - nextElement.value);
    const previousPageAvailable = computed(() => page.value > 1);
    const nextPageAvailable = computed(() => (
      (!loading.value || (nextElement.value < elements.value.length))
      && (nextElement.value < total.value)
    ));
    const pageLimits = computed(() => ({
      firstElement: firstElement.value,
      lastElement: Math.min(
        firstElement.value + FRONTEND_PAGE_SIZE - 1,
        total.value - 1,
      ),
    }));

    const pageElements = computed(
      () => elements.value.slice(firstElement.value, nextElement.value),
    );

    const requestNextPage = async () => {
      loading.value = true;
      backendPage.value += 1;

      // @ts-expect-error: The union of the page-related keys isn't perfect
      const pageRelatedRequestOptions: PageRelatedRequestOptions<PageKeyType, PageSizeKeyType> = {
        [BACKEND_PAGE_REQUEST_KEY as PageKeyType]: backendPage.value,
        ...(
          BACKEND_PAGE_SIZE_REQUEST_KEY !== undefined && {
            [BACKEND_PAGE_SIZE_REQUEST_KEY as NonNullable<PageSizeKeyType>]: (
              BACKEND_PAGE_SIZE as number
            ),
          }
        ),
      };

      // @ts-expect-error: The union of the `requestOptions` and the page-related keys isn't perfect
      const internalRequestOptions: OptionsType = {
        ...pageRelatedRequestOptions,
        ...requestOptions,
      };
      const {
        total: requestTotal,
        elements: requestElements,
      } = await paginatedRequestMethod(internalRequestOptions);
      total.value = requestTotal;
      if (requestElements.length > 0) {
        elements.value = [...elements.value, ...requestElements];
      } else {
        backendPage.value -= 1;
      }
      loading.value = false;
    };

    watchReactiveObjectKeys(requestOptions, () => {
      elements.value = [];
      backendPage.value = 0;
      resetPage();
      requestNextPage();
    });

    watch(() => page.value, () => {
      if (
        elements.value.length > 0
        && (remainingElements.value < (2 * FRONTEND_PAGE_SIZE))
        && elements.value.length < total.value
      ) {
        requestNextPage();
      }
    });

    requestNextPage();

    return {
      total,
      pageElements,
      loading,
      previousPageAvailable,
      nextPageAvailable,
      pageLimits,
    };
  };
};
