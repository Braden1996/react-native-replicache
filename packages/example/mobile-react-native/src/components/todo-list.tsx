import { listTodos, TodoUpdate } from "@react-native-replicache/example-shared";
import { nanoid } from "nanoid";
import React from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useSubscribe } from "replicache-react";

import { TodoInput } from "./todo-input";
import { TodoItem } from "./todo-item";
import { useReplicache } from "../use-replicache";
import { dropAllDatabases } from "replicache";

interface TodoListProps {
  listId: string;
}

export function TodoList({ listId }: TodoListProps) {
  const rep = useReplicache(listId);

  // Subscribe to all todos and sort them.
  const todos = useSubscribe(rep, listTodos, [], [rep]);
  todos.sort((a, b) => a.sort - b.sort);

  // Define event handlers and connect them to Replicache mutators. Each
  // of these mutators runs immediately (optimistically) locally, then runs
  // again on the server-side automatically.
  const handleNewItem = (text: string) => {
    rep.mutate.createTodo({
      id: nanoid(),
      text,
      completed: false,
    });
  };

  const handleUpdateTodo = (update: TodoUpdate) =>
    rep.mutate.updateTodo(update);

  const handleDeleteTodos = async (ids: string[]) => {
    for (const id of ids) {
      await rep.mutate.deleteTodo(id);
    }
  };

  return (
    <FlatList
      data={todos}
      renderItem={({ item }) => (
        <TodoItem
          todo={item}
          handleDelete={() => handleDeleteTodos([item.id])}
          handleUpdate={(update) =>
            handleUpdateTodo({ id: item.id, ...update })
          }
        />
      )}
      ListHeaderComponent={<TodoInput handleSubmit={handleNewItem} />}
      ListFooterComponent={
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>List: {listId}</Text>

          <Button title="Logout" onPress={async () => {
              await rep.close()
              await dropAllDatabases()
          }}></Button>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 32 }}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e6e6e6",
  },
  footerContainer: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#d9d9d9",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  footerText: {
    color: "#111111",
    fontSize: 15,
    lineHeight: 19,
  },
});
