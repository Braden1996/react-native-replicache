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
    const db = await SQLite.openDatabaseAsync(name);

    const genericDb: GenericSQLDatabase = {
      transaction: () => new ReplicacheExpoSQLiteTransaction(db),
      destroy: async () => {
        await db.closeAsync();
        await SQLite.deleteDatabaseAsync(name);
      },
      close: async () => await db.closeAsync(),
    };

    return genericDb;
  },
};

const expoDbManagerInstance = new ReplicacheGenericSQLiteDatabaseManager(
  genericDatabase,
);

export const createReplicacheExpoSQLiteExperimentalCreateKVStore =
  getCreateReplicacheSQLiteExperimentalCreateKVStore(expoDbManagerInstance);
