import {
  GenericDatabaseManager,
  GenericSQLDatabase,
} from "./generic-sqlite-adapter";

export class ReplicacheGenericSQLiteDatabaseManager {
  private _dbInstances = new Map<
    string,
    {
      db: GenericSQLDatabase;
      state: "open" | "closed";
    }
  >();

  constructor(private readonly _dbm: GenericDatabaseManager) {}

  async open(name: string) {
    const dbInstance = this._dbInstances.get(name);
    if (dbInstance?.state === "open") return dbInstance.db;

    const newDb = await this._dbm.open(`replicache-${name}.sqlite`);
    if (!dbInstance) {
      await this._setupSchema(newDb);
      this._dbInstances.set(name, { state: "open", db: newDb });
    } else {
      dbInstance.state = "open";
    }

    return newDb;
  }

  async close(name: string) {
    const dbInstance = this._dbInstances.get(name);
    if (!dbInstance) return;

    await dbInstance.db.close();
    dbInstance.state = "closed";
  }

  async truncate(name: string) {
    const db = await this.open(name);
    const tx = db.transaction();
    await tx.start(false);
    await tx.execute("DELETE FROM entry", []);
    await tx.commit();
  }

  async destroy(name: string) {
    const dbInstances = this._dbInstances.get(name);
    if (!dbInstances) return;

    await dbInstances.db.destroy();
    this._dbInstances.delete(name);
  }

  private async _setupSchema(db: GenericSQLDatabase) {
    const tx = db.transaction();
    await tx.start(false);
    await tx.execute(
      "CREATE TABLE IF NOT EXISTS entry (key TEXT PRIMARY KEY, value TEXT)",
      [],
    );
    await tx.commit();
  }
}
