export type PaginatedRequestMethod<
  ElementType,
  OptionsType,
> = (options: OptionsType) => Promise<{
  total: number,
  elements: Array<ElementType>,
}>;

export type PageRelatedRequestOptions<
  PageKeyType extends string,
  PageSizeKeyType extends string | undefined,
> = (
  Record<PageKeyType, number> & (
    PageSizeKeyType extends string
      ? Record<NonNullable<PageSizeKeyType>, number>
      : Record<never, never>
  )
)
