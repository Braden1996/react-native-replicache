import type { KVStore } from "replicache";

import { ReplicacheGenericSQLiteDatabaseManager } from "./replicache-generic-sqlite-database-manager";
import { ReplicacheGenericSQLiteReadImpl } from "./replicache-generic-sqlite-read-impl";
import { ReplicacheGenericSQLiteWriteImpl } from "./replicache-generic-sqlite-write-impl";

export class ReplicacheGenericStore
  implements KVStore
{
  private _closed = false;

  constructor(
    private readonly name: string,
    private readonly _dbm: ReplicacheGenericSQLiteDatabaseManager,
  ) {}

  async read() {
    const db = await this._getDb();
    const tx = db.transaction();
    await tx.start(true);
    return new ReplicacheGenericSQLiteReadImpl(tx);
  }

  async withRead<R>(
    fn: (
      read: Awaited<ReturnType<KVStore["read"]>>,
    ) => R | Promise<R>,
  ): Promise<R> {
    const read = await this.read();
    try {
      return await fn(read);
    } finally {
      read.release();
    }
  }

  async write(): Promise<
    Awaited<ReturnType<KVStore["write"]>>
  > {
    const db = await this._getDb();
    const tx = db.transaction();
    await tx.start(false);
    return new ReplicacheGenericSQLiteWriteImpl(tx);
  }

  async withWrite<R>(
    fn: (
      write: Awaited<
        ReturnType<KVStore["write"]>
      >,
    ) => R | Promise<R>,
  ): Promise<R> {
    const write = await this.write();
    try {
      return await fn(write);
    } finally {
      write.release();
    }
  }

  async close() {
    const db = await this._getDb();
    db.close();
    this._closed = true;
  }

  get closed(): boolean {
    return this._closed;
  }

  private async _getDb() {
    return await this._dbm.open(this.name);
  }
}

export function getCreateReplicacheSQLiteExperimentalCreateKVStore(
  db: ReplicacheGenericSQLiteDatabaseManager,
) {
  return (name: string) => new ReplicacheGenericStore(name, db);
}
