import {
  GenericSQLResultSetRowList,
  ReplicacheGenericSQLiteTransaction,
} from "@react-native-replicache/replicache-generic-sqlite";
import { NativeModulesProxy } from "expo-modules-core";

import { deserializeResultSet, serializeQuery } from "./utils";

const { ExponentSQLite } = NativeModulesProxy;

if (!ExponentSQLite) {
  throw new Error("expo-sqlite seems to be missing!");
}

export class ReplicacheExpoSQLiteTransaction extends ReplicacheGenericSQLiteTransaction {
  private _openedTransaction = false;
  private _readonly = false;
  private _txCommitted = false;
  private _txRolledBack = false;
  private _transactionEndedSubscriptions = new Set<{
    resolve: () => void;
    reject: () => void;
  }>();
  private _txEnded = false;

  constructor(private readonly _name: string) {
    super();
  }

  public async start(readonly: boolean) {
    this._readonly = readonly;

    return await new Promise<void>((resolve, reject) => {
      let didResolve = false;

      ExponentSQLite.exec(
        this._name,
        [["BEGIN TRANSACTION", []]],
        this._readonly
      ).then(
        (nativeResultSets: any) => {
          const result = deserializeResultSet(nativeResultSets[0]);
          if ("error" in result) {
            reject(result.error);
          } else {
            didResolve = true;
            this._openedTransaction = true;
            resolve();
          }
        },
        () => {
          if (!didResolve) {
            reject?.(new Error("ERROR"));
          }
          this._setTransactionEnded(true);
        }
      );
    });
  }

  public async execute(
    sqlStatement: string,
    args?: (string | number | null)[] | undefined
  ) {
    this.assertTransactionReady();

    const sqlPromise = new Promise<GenericSQLResultSetRowList>(
      (resolve, reject) => {
        ExponentSQLite.exec(
          this._name,
          [serializeQuery({ sql: sqlStatement, args: args || [] })],
          this._readonly
        ).then(
          (nativeResultSets: any) => {
            const result = deserializeResultSet(nativeResultSets[0]);
            if ("error" in result) {
              reject(result.error);
            } else {
              const { rows } = result;

              resolve({
                length: rows.length,
                item: (idx: number) => rows[idx],
              });
            }
          },
          (err: any) => {
            // We don't need to know what went wrong; just that something did.
            reject(err);

            return true; // Rollback
          }
        );
      }
    );

    try {
      return await sqlPromise;
    } catch {
      this._rollback();
      throw new Error("ROLLBACK");
    }
  }

  public async commit() {
    this._txCommitted = true;

    return await new Promise<void>((resolve, reject) => {
      ExponentSQLite.exec(this._name, [["COMMIT", []]], this._readonly).then(
        (nativeResultSets: any) => {
          const result = deserializeResultSet(nativeResultSets[0]);
          if ("error" in result) {
            reject(result.error);
            this._setTransactionEnded(true);
          } else {
            resolve();
            this._setTransactionEnded(false);
          }
        },
        (err: any) => {
          reject(err);
          this._setTransactionEnded(true);
        }
      );
    });
  }

  private async _rollback() {
    this._txRolledBack = true;

    return await new Promise<void>((resolve, reject) => {
      ExponentSQLite.exec(this._name, [["ROLLBACK", []]], this._readonly).then(
        (nativeResultSets: any) => {
          const result = deserializeResultSet(nativeResultSets[0]);
          if ("error" in result) {
            reject(result.error);
            this._setTransactionEnded(true);
          } else {
            resolve();
            this._setTransactionEnded(false);
          }
        },
        (err: any) => {
          reject(err);
          this._setTransactionEnded(true);
        }
      );
    });
  }

  public waitForTransactionEnded() {
    if (this._txEnded) return;
    return new Promise<void>((resolve, reject) => {
      this._transactionEndedSubscriptions.add({ resolve, reject });
    });
  }

  private assertTransactionReady() {
    if (!this._openedTransaction) throw new Error("Transaction is not ready.");
    if (this._txCommitted) throw new Error("Transaction already committed.");
    if (this._txRolledBack) throw new Error("Transaction already rolled back.");
    if (this._txEnded) throw new Error("Transaction already ended.");
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
