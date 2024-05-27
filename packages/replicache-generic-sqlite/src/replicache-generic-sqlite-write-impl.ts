import type { ExperimentalCreateKVStore, ReadonlyJSONValue } from "replicache";

import { ReplicacheGenericSQLiteReadImpl } from "./replicache-generic-sqlite-read-impl";

export class ReplicacheGenericSQLiteWriteImpl
  extends ReplicacheGenericSQLiteReadImpl
  implements
    Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["write"]>>
{
  async put(key: string, value: ReadonlyJSONValue) {
    const jsonValueString = JSON.stringify(value);
    await this._assertTx().execute(
      "INSERT OR REPLACE INTO entry (key, value) VALUES (?, ?)",
      [key, jsonValueString],
    );
  }

  async del(key: string) {
    await this._assertTx().execute("DELETE FROM entry WHERE key = ?", [key]);
  }

  async commit() {
    // Do nothing and wait for release.
  }
}
