import * as QuickSQLite from "react-native-quick-sqlite";

export class ReplicacheQuickSQLiteTransaction {
  private _tx: QuickSQLite.TransactionAsync | null = null;
  private _transactionReadySubscriptions = new Set<
    (tx: QuickSQLite.TransactionAsync) => void
  >();
  private _transactionFinalizedSubscriptions = new Set<() => void>();
  private _txFinalized = false;

  constructor(readonly db: QuickSQLite.QuickSQLiteConnection) {
    db.transactionAsync(async (tx) => {
      this._setTransactionReady(tx);
      await this._waitForTransactionFinalized();
    });
  }

  public async get(key: string) {
    const tx = await this.waitForTransactionReady();
    const { rows } = tx.execute("SELECT value FROM entry WHERE key = ?", [key]);

    if (rows === undefined || rows.length === 0) return undefined;

    return rows.item(0).value;
  }

  public async upsert(key: string, jsonValueString: string) {
    const tx = await this.waitForTransactionReady();
    tx.execute("INSERT OR REPLACE INTO entry (key, value) VALUES (?, ?)", [
      key,
      jsonValueString,
    ]);
  }

  public async delete(key: string) {
    const tx = await this.waitForTransactionReady();
    tx.execute("DELETE FROM entry WHERE key = ?", [key]);
  }

  public async commit() {
    const tx = await this.waitForTransactionReady();
    await tx.commit();
    this._setTransactionFinalized();
  }

  public waitForTransactionReady() {
    if (this._tx !== null) return this._tx;
    return new Promise<QuickSQLite.TransactionAsync>((resolve) => {
      this._transactionReadySubscriptions.add(resolve);
    });
  }

  private _setTransactionReady(tx: QuickSQLite.TransactionAsync) {
    this._tx = tx;
    for (const resolver of this._transactionReadySubscriptions) {
      resolver(tx);
    }
    this._transactionReadySubscriptions.clear();
  }

  private _setTransactionFinalized() {
    this._txFinalized = true;
    for (const resolver of this._transactionFinalizedSubscriptions) {
      resolver();
    }
    this._transactionFinalizedSubscriptions.clear();
  }

  private _waitForTransactionFinalized() {
    if (this._txFinalized) return;
    return new Promise<void>((resolve) => {
      this._transactionFinalizedSubscriptions.add(resolve);
    });
  }
}
