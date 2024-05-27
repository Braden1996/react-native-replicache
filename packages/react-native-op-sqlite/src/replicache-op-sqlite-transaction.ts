import * as OPSQLite from "@op-engineering/op-sqlite";
import { ReplicacheGenericSQLiteTransaction } from "@react-native-replicache/replicache-generic-sqlite";

export class ReplicacheOPSQLiteTransaction extends ReplicacheGenericSQLiteTransaction {
  private _tx: OPSQLite.Transaction | null = null;
  private _transactionCommittedSubscriptions = new Set<() => void>();
  private _txCommitted = false;
  private _transactionEndedSubscriptions = new Set<{
    resolve: () => void;
    reject: () => void;
  }>();
  private _txEnded = false;

  constructor(private readonly db: OPSQLite.OPSQLiteConnection) {
    super();
  }

  // op-sqlite doesn't support readonly
  public async start() {
    return await new Promise<void>((resolve, reject) => {
      let didResolve = false;
      try {
        this.db.transaction(async (tx) => {
          didResolve = true;
          this._tx = tx;
          resolve();

          try {
            // op-sqlite auto-commits our transaction when this callback ends.
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
    const { rows } = tx.execute(sqlStatement, args);

    if (!rows || rows.length === 0) {
      return { item: () => undefined, length: 0 };
    }

    return {
      item: (idx: number) => rows.item(idx),
      length: rows.length,
    };
  }

  public async commit() {
    const tx = this.assertTransactionReady();
    tx.commit();
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
