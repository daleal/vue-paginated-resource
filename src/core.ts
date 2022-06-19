import {
  computed, ref, shallowRef, watch,
} from 'vue';

import type { Ref } from 'vue';
import type { ComposableCreationOptions } from './types/composableCreation';
import type { PaginatedRequestMethod, PaginatedRequestOptions } from './types/requests';

export const createResourcePaginationComposable = (
  composableOptions: ComposableCreationOptions,
) => {
  const FRONTEND_PAGE_SIZE = composableOptions.frontend.pageSize;
  const BACKEND_PAGE_SIZE = composableOptions.backend.pageSize;
  const BACKEND_PAGE_REQUEST_KEY = composableOptions.backend.requestKeys?.page || 'page';
  const BACKEND_PAGE_SIZE_REQUEST_KEY = composableOptions.backend.requestKeys?.pageSize || 'size';

  return <ElementType, OptionsType extends PaginatedRequestOptions>(
    paginatedRequestMethod: PaginatedRequestMethod<ElementType, OptionsType>,
    page: Ref<number>,
    resetPage: () => void,
    requestOptions: OptionsType,
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
    const nextPageAvailable = computed(() => !loading.value && (nextElement.value < total.value));
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
      const internalRequestOptions = {
        [BACKEND_PAGE_SIZE_REQUEST_KEY]: backendPage.value,
        [BACKEND_PAGE_REQUEST_KEY]: BACKEND_PAGE_SIZE,
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

    watch(() => requestOptions, () => {
      elements.value = [];
      backendPage.value = 0;
      resetPage();
      requestNextPage();
    });

    watch(() => page.value, () => {
      if (
        elements.value.length > 0
        && (remainingElements.value < FRONTEND_PAGE_SIZE)
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
