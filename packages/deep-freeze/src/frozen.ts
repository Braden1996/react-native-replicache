declare const frozenJSONTag: unique symbol;

/**
 * Used to mark a type as having been frozen.
 */
export type FrozenTag<T> = T & { readonly [frozenJSONTag]: true };

export type FrozenJSONValue =
  | null
  | string
  | boolean
  | number
  | FrozenJSONArray
  | FrozenJSONObject;

type FrozenJSONArray = FrozenTag<readonly FrozenJSONValue[]>;

export type FrozenJSONObject = FrozenTag<{
  readonly [key: string]: FrozenJSONValue;
}>;
