import { Todo, TodoUpdate } from "@react-native-replicache/example-shared";
import classnames from "classnames";
import { useState } from "react";

import TodoTextInput from "./todo-text-input";

export function TodoItem({
  todo,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  onUpdate: (update: TodoUpdate) => void;
  onDelete: () => void;
}) {
  const { id } = todo;
  const [editing, setEditing] = useState(false);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleSave = (text: string) => {
    if (text.length === 0) {
      onDelete();
    } else {
      onUpdate({ id, text });
    }
    setEditing(false);
  };

  const handleToggleComplete = () =>
    onUpdate({ id, completed: !todo.completed });

  let element;
  if (editing) {
    element = (
      <TodoTextInput
        initial={todo.text}
        onSubmit={handleSave}
        onBlur={handleSave}
      />
    );
  } else {
    element = (
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
        />
        <label onDoubleClick={handleDoubleClick}>{todo.text}</label>
        <button className="destroy" onClick={() => onDelete()} />
      </div>
    );
  }

  return (
    <li
      className={classnames({
        completed: todo.completed,
        editing,
      })}
    >
      {element}
    </li>
  );
}
