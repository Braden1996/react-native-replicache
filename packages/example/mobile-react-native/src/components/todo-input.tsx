import React from "react";
import { StyleSheet, TextInput } from "react-native";

interface TodoInputProps {
  handleSubmit: (text: string) => void;
}

export function TodoInput({ handleSubmit }: TodoInputProps) {
  const [draftText, setDraftText] = React.useState("");

  return (
    <TextInput
      editable
      value={draftText}
      onChangeText={setDraftText}
      onSubmitEditing={() => handleSubmit(draftText)}
      style={styles.textInput}
      placeholder="What needs to be done?"
    />
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e6e6e6",
  },
});
