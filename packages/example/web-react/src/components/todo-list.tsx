import { Todo, TodoUpdate } from "@react-native-replicache/example-shared";

import { TodoItem } from "./todo-item";

const TodoList = ({
  todos,
  onUpdateTodo,
  onDeleteTodo,
}: {
  todos: Todo[];
  onUpdateTodo: (update: TodoUpdate) => void;
  onDeleteTodo: (id: string) => void;
}) => {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          todo={todo}
          key={todo.id}
          onUpdate={(update) => onUpdateTodo(update)}
          onDelete={() => onDeleteTodo(todo.id)}
        />
      ))}
    </ul>
  );
};

export default TodoList;
