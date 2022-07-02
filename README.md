<h1 align="center">Vue Paginated Resource</h1>

<p align="center">
  <em>
    The Vue pagination library <strong>designed for living beings</strong> 😵
  </em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-paginated-resource" target="_blank">
    <img src="https://img.shields.io/npm/v/vue-paginated-resource?label=version&logo=nodedotjs&logoColor=%23fff&color=f92e61" alt="NPM - Version">
  </a>

  <a href="https://github.com/daleal/vue-paginated-resource/actions?query=workflow%3Alinters" target="_blank">
    <img src="https://img.shields.io/github/workflow/status/daleal/vue-paginated-resource/linters?label=linters&logo=github" alt="Linters">
  </a>
</p>

**Vue Paginated Resource** is a tool that helps you consume a paginated resource endpoint and display its contents on a paginated fashion in your frontend, leaving the coordination heavy lifting out of your way.

## Why Vue Paginated Resource?

Let's face it: integrating backend-paginated resources into a paginated frontend **sucks**. Handling page requests, loading states and edge cases for **every resource** may very well be one of hell's worst tortures.

And there is no way around it: when you have to paginate, you have to paginate. That's where **Vue Paginated Resource** comes in.

## Installation

Install using npm! (or your favourite package manager)

```sh
# Using npm
npm install vue-paginated-resource

# Using yarn
yarn add vue-paginated-resource
```

Please note that **Vue Paginated Resource** will only work with **Vue 3**.

## Usage

### Creating the composable

Out of the box, **Vue Paginated Resource** exports a method named `createPaginatedResourceComposable`. This method receives an options object that looks like this:

```ts
interface Options {
  frontend: {
    pageSize: number,
  },
  backend?: {
    requestKeys?: {
      page?: string,
      pageSize?: string,
    },
    pageSize?: number,
  },
}
```

Its parameters are:

- `frontend.pageSize`: The size of each page displayed in your application's frontend. This key is **required**
- `backend.requestKeys.page`: The name of the key used to request a specific page to the backend. This generally translates to a query param, so if the request looks like `https://resource.com/some/resource?page-number=3`, then `backend.requestKeys.page` should be `page-number`. This key is **optional**, and its value defaults to `page`.
- `backend.requestKeys.pageSize`: The name of the key used to request a specific page size to the backend. This generally translates to a query param, so if the request looks like `https://resource.com/some/resource?size=3`, then `backend.requestKeys.pageSize` should be `size`. This key is **optional**. If the key is not defined, **Vue Paginated Resource** won't specify a page size to the backend.
- `backend.pageSize`: The size of each page from the backend's resource endpoint. This key is **optional**. You should **always** define a value for `backend.pageSize` if `backend.requestKeys.pageSize` was specified. You should **never** define a value for `backend.pageSize` if `backend.requestKeys.pageSize` was not specified.

To create the composable, first create a composable file and use code similar to the following:

```ts
// src/composables/paginatedResource.ts
import { createPaginatedResourceComposable } from 'vue-paginated-resource';

export const usePaginatedResource = createPaginatedResourceComposable({
  frontend: {
    pageSize: 15,
  },
  backend: {
    pageSize: 100,
    requestKeys: {
      page: 'page',
      pageSize: 'size',
    },
  },
});
```

## Complete Basic Example

```ts
// composables/paginatedResource.ts
import { createPaginatedResourceComposable } from 'vue-paginated-resource';

export const usePaginatedResource = createPaginatedResourceComposable({
  frontend: {
    pageSize: 15,
  },
  backend: {
    pageSize: 100,
    requestKeys: {
      page: 'page',
      pageSize: 'size',
    },
  },
});
```

```vue
<!-- components/ElementTable.vue -->
<script setup lang="ts">
import axios from 'axios';
import { reactive, ref } from 'vue';
import { usePaginatedResource } from '@/composables/paginatedResource';

interface Element { // Element from the API
  id: string,
  name: string,
}

interface Params {
  // API-related params, should be passed into the composable params
  search: string,

  // page-related params, don't get passed into the composable params
  page: number,
  size: number,
}

const getElements = async (
  params: Params,
): Promise<{ total: number, elements: Array<Element> }> => {
    const response = await axios.get('https://some.url/endpoint', { params });
    return { total: response.data.total, elements: response.data.items };
}

const page = ref(1);
const params = reactive({ search: 'some search' });

const previousPage = () => {
  page.value -= 1;
}

const nextPage = () => {
  page.value += 1;
}

const resetPage = () => {
  page.value = 1;
};

const {
  pageElements,
  previousPageAvailable,
  nextPageAvailable,
} = useResourcePagination(getElements, page, resetPage, params);
</script>

<template>
  <div>
    <button
      :disabled="!previousPageAvailable"
      @click="previousPage"
    >
      previous
    </button>
    <button
      :disabled="!nextPageAvailable"
      @click="nextPage"
    >
      next
    </button>
    <p
      v-for="element in pageElements"
      :key="element.id"
    >
      {{ element.name }}
    </p>
  </div>
</template>
```
