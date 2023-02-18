import * as QuickSQLite from "react-native-quick-sqlite";

export class ReplicacheDatabaseManager {
  private static _openDbs = new Map<
    string,
    QuickSQLite.QuickSQLiteConnection
  >();

  static open(name: string) {
    const db = this._openDbs.get(name);
    if (db) return db;

    const newDb = QuickSQLite.open({
      name: `replicache-${name}.sqlite`,
    });

    this._setupSchema(newDb);
    this._openDbs.set(name, newDb);

    return newDb;
  }

  static close(name: string) {
    const db = this._openDbs.get(name);
    if (!db) return;

    db.close();
    this._openDbs.delete(name);
  }

  static truncate(name: string) {
    const db = this.open(name);
    db.execute("DELETE FROM entry");
  }

  static destroy(name: string) {
    const db = this._openDbs.get(name);
    if (!db) return;

    db.execute("DROP TABLE IF EXISTS entry");
    this.close(name);
  }

  private static _setupSchema(db: QuickSQLite.QuickSQLiteConnection) {
    db.execute(
      "CREATE TABLE IF NOT EXISTS entry (key TEXT PRIMARY KEY, value TEXT)"
    );
  }
}
