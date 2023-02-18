import {
  M,
  listTodos,
  TodoUpdate,
} from "@react-native-replicache/example-shared";
import { nanoid } from "nanoid";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";

import Header from "./components/header";
import MainSection from "./components/main-section";

// This is the top-level component for our app.
const App = ({ rep }: { rep: Replicache<M> }) => {
  // Subscribe to all todos and sort them.
  const todos = useSubscribe(rep, listTodos, [], [rep]);
  todos.sort((a, b) => a.sort - b.sort);
  // Define event handlers and connect them to Replicache mutators. Each
  // of these mutators runs immediately (optimistically) locally, then runs
  // again on the server-side automatically.
  const handleNewItem = (text: string) =>
    rep.mutate.createTodo({
      id: nanoid(),
      text,
      completed: false,
    });

  const handleUpdateTodo = (update: TodoUpdate) =>
    rep.mutate.updateTodo(update);

  const handleDeleteTodos = async (ids: string[]) => {
    for (const id of ids) {
      await rep.mutate.deleteTodo(id);
    }
  };

  const handleCompleteTodos = async (completed: boolean, ids: string[]) => {
    for (const id of ids) {
      await rep.mutate.updateTodo({
        id,
        completed,
      });
    }
  };

  // Render app.

  return (
    <div className="todoapp">
      <Header onNewItem={handleNewItem} />
      <MainSection
        todos={todos}
        onUpdateTodo={handleUpdateTodo}
        onDeleteTodos={handleDeleteTodos}
        onCompleteTodos={handleCompleteTodos}
      />
    </div>
  );
};

export default App;
