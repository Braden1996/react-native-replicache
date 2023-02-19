import {
  GenericDatabaseManager,
  GenericSQLDatabase,
  getCreateReplicacheSQLiteExperimentalCreateKVStore,
  ReplicacheGenericSQLiteDatabaseManager,
} from "@react-native-replicache/replicache-generic-sqlite";
import * as SQLite from "expo-sqlite";

import { ReplicacheExpoSQLiteTransaction } from "./replicache-expo-sqlite-transaction";

const genericDatabase: GenericDatabaseManager = {
  open: async (name: string) => {
    const db = SQLite.openDatabase(name);

    const genericDb: GenericSQLDatabase = {
      transaction: () => new ReplicacheExpoSQLiteTransaction(name),
      destroy: async () => {
        await db.closeAsync();
        await db.deleteAsync();
      },
      close: async () => await db.closeAsync(),
    };

    return genericDb;
  },
};

const expoDbManagerInstance = new ReplicacheGenericSQLiteDatabaseManager(
  genericDatabase
);

export const createReplicacheExpoSQLiteExperimentalCreateKVStore =
  getCreateReplicacheSQLiteExperimentalCreateKVStore(expoDbManagerInstance);
