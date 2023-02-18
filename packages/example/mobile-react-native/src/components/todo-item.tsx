import { Todo, TodoUpdate } from "@react-native-replicache/example-shared";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TodoItemProps {
  todo: Todo;
  handleUpdate: (update: Omit<TodoUpdate, "id">) => void;
  handleDelete: () => void;
}

export function TodoItem({ todo, handleUpdate, handleDelete }: TodoItemProps) {
  return (
    <View style={styles.itemContainer}>
      <Pressable onPress={() => handleUpdate({ completed: !todo.completed })}>
        {todo.completed ? (
          <View style={[styles.checkbox, styles.checkboxCompleted]}>
            <Text style={styles.checkboxCompletedCheckText}>✓</Text>
          </View>
        ) : (
          <View style={styles.checkbox} />
        )}
      </Pressable>
      <Text
        style={
          todo.completed
            ? [styles.itemText, styles.itemTextCompleted]
            : styles.itemText
        }
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {todo.text}
      </Text>

      <Pressable onPress={() => handleDelete()}>
        <View style={styles.deleteContainer}>
          <Text style={styles.deleteText}>X</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#a9a9a9",
    borderRadius: 20,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    borderColor: "#3fa390",
  },
  checkboxCompletedCheckText: {
    color: "#3fa390",
    fontSize: 24,
  },
  itemContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
  },
  itemText: {
    flex: 1,
    fontSize: 24,
    lineHeight: 1.2 * 24,
    fontWeight: "400",
    color: "#484848",
  },
  deleteContainer: {
    marginLeft: 16,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#c94545",
    fontSize: 24,
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: "#949494",
  },
});
