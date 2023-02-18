import { ReplicacheQuickSQLiteReadImpl } from "./replicache-quick-sqlite-read-impl";
import { ReplicacheQuickSQLiteTransaction } from "./replicache-quick-sqlite-transaction";
import {
  deleteSentinel,
  ReplicacheQuickSQLiteWriteImplBase,
} from "./replicache-quick-sqlite-write-impl-base";

export class ReplicacheQuickSQLiteWriteImpl extends ReplicacheQuickSQLiteWriteImplBase {
  private readonly _tx: ReplicacheQuickSQLiteTransaction;
  private _closed = false;

  constructor(tx: ReplicacheQuickSQLiteTransaction) {
    super(new ReplicacheQuickSQLiteReadImpl(tx));
    this._tx = tx;
  }

  async commit() {
    if (this._pending.size === 0) {
      return;
    }

    await Promise.all(
      [...this._pending.entries()].map(async ([key, value]) => {
        if (value === deleteSentinel) {
          await this._tx.delete(key);
        } else {
          const jsonValueString = JSON.stringify(value);
          await this._tx.upsert(key, jsonValueString);
        }
      })
    );

    this._pending.clear();
  }

  release() {
    this._tx.commit();
    this._closed = true;
  }

  get closed() {
    return this._closed;
  }
}
