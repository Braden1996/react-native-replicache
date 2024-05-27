import { ReplicacheGenericSQLiteTransaction } from "@react-native-replicache/replicache-generic-sqlite";
import * as SQLite from "expo-sqlite";

export class ReplicacheExpoSQLiteTransaction extends ReplicacheGenericSQLiteTransaction {
  private _tx:
    | Parameters<
        Parameters<SQLite.SQLiteDatabase["withExclusiveTransactionAsync"]>[0]
      >[0]
    | null = null;
  private _transactionCommittedSubscriptions = new Set<() => void>();
  private _txCommitted = false;
  private _transactionEndedSubscriptions = new Set<{
    resolve: () => void;
    reject: () => void;
  }>();
  private _txEnded = false;

  constructor(private readonly db: SQLite.SQLiteDatabase) {
    super();
  }

  // expo-sqlite doesn't support readonly
  public async start() {
    return await new Promise<void>((resolve, reject) => {
      let didResolve = false;
      try {
        this.db.withExclusiveTransactionAsync(async (tx) => {
          didResolve = true;
          this._tx = tx;
          resolve();

          try {
            // expo-sqlite auto-commits our transaction when this callback ends.
            // Lets artificially keep it open until we commit.
            await this._waitForTransactionCommitted();
            this._setTransactionEnded(false);
          } catch {
            this._setTransactionEnded(true);
          }
        });
      } catch {
        if (!didResolve) {
          reject(new Error("Did not resolve"));
        }
      }
    });
  }

  public async execute(
    sqlStatement: string,
    args?: (string | number | null)[] | undefined,
  ) {
    const tx = this.assertTransactionReady();

    const statement = await tx.prepareAsync(sqlStatement);
    let allRows: any;
    let result: any;
    try {
      result = await statement.executeAsync(...(args ?? []));
      allRows = await result.getAllAsync();
    } finally {
      await statement.finalizeAsync();
    }

    return {
      item: (idx: number) => allRows[idx],
      length: allRows.length,
    };
  }

  public async commit() {
    // Transaction is committed automatically.
    this._txCommitted = true;
    for (const resolver of this._transactionCommittedSubscriptions) {
      resolver();
    }
    this._transactionCommittedSubscriptions.clear();
  }

  public waitForTransactionEnded() {
    if (this._txEnded) return;
    return new Promise<void>((resolve, reject) => {
      this._transactionEndedSubscriptions.add({ resolve, reject });
    });
  }

  private assertTransactionReady() {
    if (this._tx === null) throw new Error("Transaction is not ready.");
    if (this._txCommitted) throw new Error("Transaction already committed.");
    if (this._txEnded) throw new Error("Transaction already ended.");
    return this._tx;
  }

  private _waitForTransactionCommitted() {
    if (this._txCommitted) return;
    return new Promise<void>((resolve) => {
      this._transactionCommittedSubscriptions.add(resolve);
    });
  }

  private _setTransactionEnded(errored = false) {
    this._txEnded = true;
    for (const { resolve, reject } of this._transactionEndedSubscriptions) {
      if (errored) {
        reject();
      } else {
        resolve();
      }
    }
    this._transactionEndedSubscriptions.clear();
  }
}
