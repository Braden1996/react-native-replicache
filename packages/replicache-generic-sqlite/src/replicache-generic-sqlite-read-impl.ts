import { deepFreeze } from "@react-native-replicache/deep-freeze";
import type { KVStore, ReadonlyJSONValue } from "replicache";

import { ReplicacheGenericSQLiteTransaction } from "./generic-sqlite-adapter";

export class ReplicacheGenericSQLiteReadImpl
  implements Awaited<ReturnType<KVStore["read"]>>
{
  protected _tx: ReplicacheGenericSQLiteTransaction | null;

  constructor(tx: ReplicacheGenericSQLiteTransaction) {
    this._tx = tx;
  }

  async has(key: string) {
    const unsafeValue = await this._getSql(key);
    return unsafeValue === undefined;
  }

  async get(key: string) {
    const unsafeValue = await this._getSql(key);
    if (unsafeValue === undefined) return;
    const parsedValue = JSON.parse(unsafeValue) as ReadonlyJSONValue;
    // @ts-ignore
    const frozenValue = deepFreeze(parsedValue);
    return frozenValue;
  }

  async release() {
    const tx = this._assertTx();
    await tx.commit();
    this._tx = null;
  }

  get closed(): boolean {
    return this._tx === null;
  }

  private async _getSql(key: string) {
    const rows = await this._assertTx().execute(
      "SELECT value FROM entry WHERE key = ?",
      [key]
    );

    if (rows.length === 0) return undefined;

    return rows.item(0).value;
  }

  protected _assertTx() {
    if (this._tx === null) throw new Error("Transaction is closed");
    return this._tx;
  }
}
