/** The values that can be represented in JSON */
export type JSONValue =
  | null
  | string
  | boolean
  | number
  | JSONValue[]
  | JSONObject;

/**
 * A JSON object. This is a map from strings to JSON values.
 */
export type JSONObject = {
  [key: string]: JSONValue;
};

/** Like {@link JSONValue} but deeply readonly */
export type ReadonlyJSONValue =
  | null
  | string
  | boolean
  | number
  | readonly ReadonlyJSONValue[]
  | ReadonlyJSONObject;

/** Like {@link JSONObject} but deeply readonly */
export type ReadonlyJSONObject = {
  readonly [key: string]: ReadonlyJSONValue;
};
