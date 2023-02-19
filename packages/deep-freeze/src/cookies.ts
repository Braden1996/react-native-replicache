import type { FrozenJSONValue } from "./frozen";
import { ReadonlyJSONValue } from "./json-value";

/**
 * A cookie is a value that is used to determine the order of snapshots. It
 * needs to be comparable. This can be a `string`, `number` or if you want to
 * use a more complex value, you can use an object with an `order` property. The
 * value `null` is considered to be less than any other cookie and it is used
 * for the first pull when no cookie has been set.
 *
 * The order is the natural order of numbers and strings. If one of the cookies
 * is an object then the value of the `order` property is treated as the cookie
 * when doing comparison.
 *
 * If one of the cookies is a string and the other is a number, the number is
 * fist converted to a string (using `toString()`).
 */
export type Cookie =
  | null
  | string
  | number
  | (ReadonlyJSONValue & { readonly order: number | string });

export type FrozenCookie =
  | null
  | string
  | number
  | (FrozenJSONValue & { readonly order: number | string });
