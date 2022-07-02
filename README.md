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

And there is no way around it: when you have to paginate, you have to paginate. That's where **Vue Paginated Resource** comes in. With this tool, you can forget about the backend pagination and think in terms of the pages being viewed by the frontend user.

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
      page: 'page-number',
      pageSize: 'size',
    },
  },
});
```

### Creating the API adapter

Now that you have the composable created, you need to create a method that receives an options object, makes the request to the API and returns the response.

This part is tricky: the options object needs to include a key named after the value of the `backend.requestKeys.page` configuration of the composable. If you defined `backend.requestKeys.pageSize` in the configuration of the composable, you also need to include a key named after its value.

The options object also needs to include any other options you need to pass to the request. These options will probably be filters for the endpoint or stuff like that.

Finally, the adapter needs to return an promise that resolves into an object with a `total` key (the total amount of elements in the backend) and an `elements` key (an array of the elements **present in the requested page**).

Using our previous composable configuration, let's write the API adapter (in our example, the API always returns an object with a `total` key and an `items` key, but sometimes APIs return the total amount of elements using a header):

```ts
// src/adapters/resource.ts
import axios from 'axios';

export interface Resource {
  id: string,
  title: string,
  amount: number,
  imageUrl: string,
}

type AdapterResponse = Promise<{ total: number, elements: Array<Resource> }>;

interface Options {
  'page-number': number,
  size: number,
  search: string,
}

export const getResource = (options: Options): AdapterResponse => {
  const response = await axios.get(
    'https://resource.com/some/resource',
    { params: options },
  );
  return { total: response.data.total, elements: response.data.items };
}
```

Notice that in this example we simply pass the `options` object to the params of the request, but you can process them however you like inside the adapter. Same goes to the response of the API.

### Using Vue Paginated Resource

Now that you created the composable and the API adapter, you are ready to use **Vue Paginated Endpoint**. You first need to define a variable for the current page (**as a `Ref`**) and the parameters that are **not backend page related**:

```vue
<!-- src/views/ResourceDashboard.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue';

const page = ref(1);
const params = reactive({ search: '' });
</script>
```

Notice that the `params` variable corresponds to **a `reactive` object** that contains the same attributes as the API adapter method's options object except for the backend page related keys (in our case, `page-number` and `size`), so we are left with only `search`.

You will also need to define a method to reset the page to the first one. This is useful if you need to change something other than the pagination stuff on resetting the pagination:

```vue
<!-- src/views/ResourceDashboard.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue';

const page = ref(1);
const params = reactive({ search: '' });

const resetPage = () => {
  // maybe do something
  page.value = 1;
  // maybe do some other thing
}
</script>
```

**Make sure to move the value of the page to the first page**, or **Vue Paginated Resource** won't work as expected.

Finally, you can use the composable:

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { getResource } from 'src/adapters/resource';
import { usePaginatedResource } from 'src/adapters/resource';

const page = ref(1);
const params = reactive({ search: '' });

const resetPage = () => {
  // maybe do something
  page.value = 1;
  // maybe do some other thing
}

const { ... } = usePaginatedResource(getResource, page, resetPage, params);
</script>
```

We will discuss the values returned by the `usePaginatedResource` method later.

Notice that we passed the `page` attribute **as a `Ref`** without unwrapping it. We also passed `params` **as a `reactive` object**.

Changing the value of `page.value` from the component will (reactively) update the values returned from the `usePaginatedResource` method. That is your main way of navigation, between pages.

Changing the value of one of the `params`'s attributes **will call the `resetPage` method and re-do every request using the new parameters**. That's why having an "_apply_" button is highly recommended, as dynamically changing the values of the `params` will make a ton of requests to the API and might introduce some unexpected bugs.

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
