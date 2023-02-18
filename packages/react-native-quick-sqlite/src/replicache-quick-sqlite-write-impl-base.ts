import { ExperimentalCreateKVStore, ReadonlyJSONValue } from "replicache";

import { deepFreeze } from "./utils/deep-freeze/deepFreeze";
import { FrozenJSONValue } from "./utils/deep-freeze/frozen";

export const deleteSentinel = Symbol();
type DeleteSentinel = typeof deleteSentinel;

export class ReplicacheQuickSQLiteWriteImplBase {
  protected readonly _pending: Map<string, FrozenJSONValue | DeleteSentinel> =
    new Map();
  private readonly _read: Awaited<
    ReturnType<ReturnType<ExperimentalCreateKVStore>["read"]>
  >;

  constructor(
    read: Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["read"]>>
  ) {
    this._read = read;
  }

  async has(key: string) {
    switch (this._pending.get(key)) {
      case undefined:
        return await this._read.has(key);
      case deleteSentinel:
        return false;
      default:
        return true;
    }
  }

  async get(key: string) {
    const v = this._pending.get(key);
    switch (v) {
      case deleteSentinel:
        return undefined;
      case undefined: {
        const v = await this._read.get(key);
        return deepFreeze(v);
      }
      default:
        return v;
    }
  }

  async put(key: string, value: ReadonlyJSONValue) {
    this._pending.set(key, deepFreeze(value));
  }

  async del(key: string) {
    this._pending.set(key, deleteSentinel);
  }

  release() {
    this._read.release();
  }

  get closed() {
    return this._read.closed;
  }
}
