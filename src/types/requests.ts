export type PaginatedRequestOptions = Record<string, unknown>

export type PaginatedRequestMethod<
  ElementType,
  OptionsType extends PaginatedRequestOptions,
> = (options: OptionsType) => Promise<{
  total: number,
  elements: Array<ElementType>,
}>;
