import * as OPSQLite from "@op-engineering/op-sqlite";
import {
  GenericDatabaseManager,
  getCreateReplicacheSQLiteKVStore,
  ReplicacheGenericSQLiteDatabaseManager,
} from "@react-native-replicache/replicache-generic-sqlite";

import { ReplicacheOPSQLiteTransaction } from "./replicache-op-sqlite-transaction";

const genericDatabase: GenericDatabaseManager = {
  open: async (name: string) => {
    const db = OPSQLite.open({ name });

    return {
      transaction: () => new ReplicacheOPSQLiteTransaction(db),
      destroy: async () => db.delete(),
      close: async () => db.close(),
    };
  },
};

const opSqlManagerInstance = new ReplicacheGenericSQLiteDatabaseManager(
  genericDatabase,
);

export const createReplicacheReactNativeOPSQLiteKVStore = {
  create: getCreateReplicacheSQLiteKVStore(opSqlManagerInstance),
  drop: opSqlManagerInstance.destroy,
};
