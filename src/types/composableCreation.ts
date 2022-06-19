export interface ComposableCreationOptions {
  frontend: {
    pageSize: number,
  },
  backend?: {
    pageSize?: number,
    requestKeys?: {
      /** @defaultValue 'page' */
      page?: string,
      /** @defaultValue 'size' */
      pageSize?: string,
    },
  },
}
