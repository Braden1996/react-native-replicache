import {
  GenericDatabaseManager,
  GenericSQLDatabase,
} from "./generic-sqlite-adapter";

export class ReplicacheGenericSQLiteDatabaseManager {
  private _openDbs = new Map<string, GenericSQLDatabase>();

  constructor(private readonly _dbm: GenericDatabaseManager) {}

  async open(name: string) {
    const db = this._openDbs.get(name);
    if (db) return db;

    const newDb = await this._dbm.open(`replicache-${name}.sqlite`);

    await this._setupSchema(newDb);
    this._openDbs.set(name, newDb);

    return newDb;
  }

  async close(name: string) {
    const db = this._openDbs.get(name);
    if (!db) return;

    await db.close();
    this._openDbs.delete(name);
  }

  async truncate(name: string) {
    const db = await this.open(name);
    const tx = db.transaction();
    await tx.start(false);
    await tx.execute("DELETE FROM entry", []);
    await tx.commit();
  }

  async destroy(name: string) {
    const db = this._openDbs.get(name);
    if (!db) return;

    await db.destroy();
  }

  private async _setupSchema(db: GenericSQLDatabase) {
    const tx = db.transaction();
    await tx.start(false);
    await tx.execute(
      "CREATE TABLE IF NOT EXISTS entry (key TEXT PRIMARY KEY, value TEXT)",
      []
    );
    await tx.commit();
  }
}
