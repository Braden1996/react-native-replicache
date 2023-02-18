import { Space } from "@react-native-replicache/example-client-shared";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TodoList } from "./components/todo-list";

const space = new Space("http://127.0.0.1:8080");

export function App() {
  const [listId, setListId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (listId !== null) return;
    const createList = async () => {
      const listId = await space.create();
      setListId(listId);
    };
    createList();
  }, [listId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>todos</Text>
      <View
        style={{ flex: 1, alignItems: "stretch", justifyContent: "center" }}
      >
        {listId === null ? (
          <ActivityIndicator size="large" />
        ) : (
          <TodoList listId={listId} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "stretch",
  },
  title: {
    fontSize: 80,
    fontWeight: "200",
    textAlign: "center",
    color: "#b83f45",
  },
});
