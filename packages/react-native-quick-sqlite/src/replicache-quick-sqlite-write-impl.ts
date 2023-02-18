import { ExperimentalCreateKVStore, ReadonlyJSONValue } from "replicache";

import { ReplicacheQuickSQLiteReadImpl } from "./replicache-quick-sqlite-read-impl";

export class ReplicacheQuickSQLiteWriteImpl
  extends ReplicacheQuickSQLiteReadImpl
  implements
    Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["write"]>>
{
  async put(key: string, value: ReadonlyJSONValue) {
    const jsonValueString = JSON.stringify(value);
    await this._tx.upsert(key, jsonValueString);
  }

  async del(key: string) {
    await this._tx.delete(key);
  }

  async commit() {
    // Do nothing and wait for release.
  }
}
