# Development Application

You can use this application as a development playground.

Inside the `src` sub-folder you will find a `VuePaginatedResourcePlayground.template.vue` file. Copy the contents of that file into a `VuePaginatedResourcePlayground.vue` file on the same directory and put anything you need inside that file! It will be gitignored, so you can't screw up your Pull Request by trying your method.

## Importing methods

To import a method from the **built library**, first build the library and then just import it:

```ts
import { ... } from 'vue-paginated-resource';
```


You can also use the _live_ code directly, by using the `@` alias instead. Because the library's main export is located at `src/main.ts`, you can use _live_ code by importing a method like this:

```ts
import { ... } from '@/main';
```
