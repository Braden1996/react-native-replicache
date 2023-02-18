import { ExperimentalCreateKVStore, ReadonlyJSONValue } from "replicache";

import { ReplicacheQuickSQLiteTransaction } from "./replicache-quick-sqlite-transaction";
import { deepFreeze } from "./utils/deep-freeze/deepFreeze";

export class ReplicacheQuickSQLiteReadImpl
  implements Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["read"]>>
{
  private _closed = false;

  constructor(private readonly _tx: ReplicacheQuickSQLiteTransaction) {}

  async has(key: string) {
    const unsafeValue = await this._tx.get(key);
    return unsafeValue === undefined;
  }

  async get(key: string) {
    const unsafeValue = await this._tx.get(key);
    if (unsafeValue === undefined) return;
    const parsedValue = JSON.parse(unsafeValue) as ReadonlyJSONValue;
    const frozenValue = deepFreeze(parsedValue);
    return frozenValue;
  }

  release() {
    this._tx.commit();
    this._closed = true;
  }

  get closed(): boolean {
    return this._closed;
  }
}
