export interface ComposableCreationOptions<
  PageKeyType extends string,
  PageSizeKeyType extends string | undefined,
  PageSizeType = PageSizeKeyType extends string ? number : never,
> {
  frontend: {
    pageSize: number,
  },
  backend?: {
    requestKeys?: {
      /** @defaultValue 'page' */
      page?: PageKeyType,
      pageSize?: PageSizeKeyType,
    },
    pageSize?: PageSizeType,
  },
}
