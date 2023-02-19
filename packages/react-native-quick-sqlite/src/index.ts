import {
  GenericDatabaseManager,
  getCreateReplicacheSQLiteExperimentalCreateKVStore,
  ReplicacheGenericSQLiteDatabaseManager,
} from "@react-native-replicache/replicache-generic-sqlite";
import * as QuickSQLite from "react-native-quick-sqlite";

import { ReplicacheQuickSQLiteTransaction } from "./replicache-quick-sqlite-transaction";

const genericDatabase: GenericDatabaseManager = {
  open: async (name: string) => {
    const db = QuickSQLite.open({ name });

    return {
      transaction: () => new ReplicacheQuickSQLiteTransaction(db),
      destroy: async () => db.delete(),
      close: async () => db.close(),
    };
  },
};

const quickSqlManagerInstance = new ReplicacheGenericSQLiteDatabaseManager(
  genericDatabase
);

export const createReplicacheReactNativeQuickSQLiteExperimentalCreateKVStore =
  getCreateReplicacheSQLiteExperimentalCreateKVStore(quickSqlManagerInstance);
