import * as QuickSQLite from "react-native-quick-sqlite";
import { ExperimentalCreateKVStore } from "replicache";

import { ReplicacheQuickSQLiteReadImpl } from "./replicache-quick-sqlite-read-impl";
import { ReplicacheQuickSQLiteTransaction } from "./replicache-quick-sqlite-transaction";
import { ReplicacheQuickSQLiteWriteImpl } from "./replicache-quick-sqlite-write-impl";
import { ReplicacheDatabaseManager } from "./utils/replicache-database-manager";

export class ReplicacheQuickSQLiteStore
  implements ReturnType<ExperimentalCreateKVStore>
{
  private readonly _db: QuickSQLite.QuickSQLiteConnection;
  private _closed = false;

  constructor(name: string) {
    this._db = ReplicacheDatabaseManager.open(name);
  }

  async read() {
    const tx = new ReplicacheQuickSQLiteTransaction(this._db);
    await tx.waitForTransactionReady();
    return new ReplicacheQuickSQLiteReadImpl(tx);
  }

  async withRead<R>(
    fn: (
      read: Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["read"]>>
    ) => R | Promise<R>
  ): Promise<R> {
    const read = await this.read();
    try {
      return await fn(read);
    } finally {
      read.release();
    }
  }

  async write(): Promise<
    Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["write"]>>
  > {
    const tx = new ReplicacheQuickSQLiteTransaction(this._db);
    await tx.waitForTransactionReady();
    return new ReplicacheQuickSQLiteWriteImpl(tx);
  }

  async withWrite<R>(
    fn: (
      write: Awaited<ReturnType<ReturnType<ExperimentalCreateKVStore>["write"]>>
    ) => R | Promise<R>
  ): Promise<R> {
    const write = await this.write();
    try {
      return await fn(write);
    } finally {
      write.release();
    }
  }

  async close() {
    this._db.close();
    this._closed = true;
  }

  get closed(): boolean {
    return this._closed;
  }
}

export const createReplicacheQuickSQLiteExperimentalCreateKVStore: ExperimentalCreateKVStore =
  (name: string) => new ReplicacheQuickSQLiteStore(name);
