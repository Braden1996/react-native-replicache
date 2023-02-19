import { Query, ResultSet, ResultSetError } from "expo-sqlite";
import { Platform } from "react-native";

function zipObject(keys: string[], values: any[]) {
  const result: { [column: string]: any } = {};
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = values[i];
  }
  return result;
}

export function deserializeResultSet(
  nativeResult: any
): ResultSet | ResultSetError {
  const [errorMessage, insertId, rowsAffected, columns, rows] = nativeResult;
  // TODO: send more structured error information from the native module so we can better construct
  // a SQLException object
  if (errorMessage !== null) {
    return { error: new Error(errorMessage) } as ResultSetError;
  }

  return {
    insertId,
    rowsAffected,
    rows: rows.map((row: any[]) => zipObject(columns, row)),
  };
}

export function escapeBlob<T>(data: T): T {
  if (typeof data === "string") {
    /* eslint-disable no-control-regex */
    return data
      .replace(/\u0002/g, "\u0002\u0002")
      .replace(/\u0001/g, "\u0001\u0002")
      .replace(/\u0000/g, "\u0001\u0001") as any;
    /* eslint-enable no-control-regex */
  } else {
    return data;
  }
}

export function serializeQuery(query: Query): [string, unknown[]] {
  return [
    query.sql,
    Platform.OS === "android" ? query.args.map(escapeBlob) : query.args,
  ];
}
