import type { ReadonlyJSONValue, ReadonlyJSONObject } from "replicache";

import { throwInvalidType } from "./asserts";
import { skipAssertJSONValue, skipFreeze, skipFrozenAsserts } from "./config";
import type { Cookie, FrozenCookie } from "./cookies";
import type { FrozenJSONValue } from "./frozen";
import { hasOwn } from "./hasOwn";

/**
 * We tag deep frozen objects in debug mode so that we do not have to deep
 * freeze an object more than once.
 */
const deepFrozenObjects = new WeakSet<object>();

/**
 * Recursively freezes the passed in value (mutates it) and returns it.
 *
 * This is controlled by `skipFreeze` which is true in release mode.
 */
export function deepFreeze(v: undefined): undefined;
export function deepFreeze(v: Cookie): FrozenCookie;
export function deepFreeze(v: ReadonlyJSONValue): FrozenJSONValue;
export function deepFreeze(
  v: ReadonlyJSONValue | undefined,
): FrozenJSONValue | undefined;
export function deepFreeze(
  v: ReadonlyJSONValue | undefined,
): FrozenJSONValue | undefined {
  if (skipFreeze) {
    return v as FrozenJSONValue | undefined;
  }

  if (v === undefined) {
    return undefined;
  }

  deepFreezeInternal(v, []);
  return v as FrozenJSONValue;
}

function deepFreezeInternal(v: ReadonlyJSONValue, seen: object[]): void {
  switch (typeof v) {
    case "boolean":
    case "number":
    case "string":
      return;
    case "object": {
      if (v === null) {
        return;
      }

      if (deepFrozenObjects.has(v)) {
        return;
      }
      deepFrozenObjects.add(v);

      if (seen.includes(v)) {
        throwInvalidType(v, "Cyclic JSON object");
      }

      seen.push(v);

      Object.freeze(v);
      if (Array.isArray(v)) {
        deepFreezeArray(v, seen);
      } else {
        deepFreezeObject(v as ReadonlyJSONObject, seen);
      }
      seen.pop();
      return;
    }

    default:
      throwInvalidType(v, "JSON value");
  }
}

function deepFreezeArray(
  v: readonly ReadonlyJSONValue[],
  seen: object[],
): void {
  for (const item of v) {
    deepFreezeInternal(item, seen);
  }
}

function deepFreezeObject(v: ReadonlyJSONObject, seen: object[]): void {
  for (const k in v) {
    if (hasOwn(v, k)) {
      deepFreezeInternal(v[k], seen);
    }
  }
}

export function assertFrozenJSONValue(
  v: unknown,
): asserts v is FrozenJSONValue {
  if (skipFrozenAsserts || skipAssertJSONValue) {
    return;
  }
  switch (typeof v) {
    case "boolean":
    case "number":
    case "string":
      return;
    case "object":
      if (v === null) {
        return;
      }

      if (isDeepFrozen(v, [])) {
        return;
      }
  }
  throwInvalidType(v, "JSON value");
}

export function assertDeepFrozen<V>(v: V): asserts v is Readonly<V> {
  if (skipFrozenAsserts) {
    return;
  }

  if (!isDeepFrozen(v, [])) {
    throw new Error("Expected frozen object");
  }
}

/**
 * Recursive deep frozen check.
 *
 * It adds frozen objects to the {@link deepFrozenObjects} WeakSet so that we do
 * not have to check the same object more than once.
 */
export function isDeepFrozen(v: unknown, seen: object[]): boolean {
  switch (typeof v) {
    case "boolean":
    case "number":
    case "string":
      return true;
    case "object":
      if (v === null) {
        return true;
      }

      if (deepFrozenObjects.has(v)) {
        return true;
      }

      if (!Object.isFrozen(v)) {
        return false;
      }

      if (seen.includes(v)) {
        throwInvalidType(v, "Cyclic JSON object");
      }

      seen.push(v);

      if (Array.isArray(v)) {
        for (const item of v) {
          if (!isDeepFrozen(item, seen)) {
            seen.pop();
            return false;
          }
        }
      } else {
        for (const k in v) {
          if (
            hasOwn(v, k) &&
            !isDeepFrozen((v as Record<string, unknown>)[k], seen)
          ) {
            seen.pop();
            return false;
          }
        }
      }

      deepFrozenObjects.add(v);
      seen.pop();
      return true;

    default:
      throwInvalidType(v, "JSON value");
  }
}
