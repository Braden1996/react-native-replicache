import classnames from "classnames";
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";

export default function TodoTextInput({
  initial,
  placeholder,
  onBlur,
  onSubmit,
}: {
  initial: string;
  placeholder?: string;
  onBlur?: (text: string) => void;
  onSubmit: (text: string) => void;
}) {
  const [textInput, setTextInput] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(textInput);
      setTextInput("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(textInput);
    }
  };

  return (
    <input
      ref={ref}
      className={classnames({
        edit: initial !== "",
        "new-todo": initial === "",
      })}
      type="text"
      placeholder={placeholder}
      autoFocus
      value={textInput}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleSubmit}
    />
  );
}
