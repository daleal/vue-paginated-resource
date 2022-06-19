export type PaginatedRequestMethod<
  ElementType,
  OptionsType,
> = (options: OptionsType) => Promise<{
  total: number,
  elements: Array<ElementType>,
}>;
