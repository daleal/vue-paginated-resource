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

export type PaginatedRequestMethod<
  ElementType,
  OptionsType,
> = (options: OptionsType) => Promise<PaginatedRequestMethodReturn<ElementType>>;

export interface PaginatedRequestMethodReturn<ElementType> {
  total: number,
  elements: Array<ElementType>,
}
