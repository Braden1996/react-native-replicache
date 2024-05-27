export interface GenericSQLResultSetRowList {
  length: number;
  item(index: number): any;
}

export abstract class ReplicacheGenericSQLiteTransaction {
  public abstract start(readonly?: boolean): Promise<void>;

  public abstract execute(
    sqlStatement: string,
    args?: (string | number | null)[] | undefined,
  ): Promise<GenericSQLResultSetRowList>;

  public abstract commit(): Promise<void>;
}

export interface GenericSQLDatabase {
  transaction: () => ReplicacheGenericSQLiteTransaction;
  destroy: () => Promise<void>;
  close: () => Promise<void>;
}

export interface GenericDatabaseManager {
  open: (name: string) => Promise<GenericSQLDatabase>;
}
