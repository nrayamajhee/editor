import MonacoEditor, { type Monaco as M } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import type { SubmitFunction } from "react-router";

type MonacoProps = {
  defaultText: string;
  setText: (newText: string) => void;
  getToken: () => Promise<string | null>;
  submit: SubmitFunction;
};

export default function Monaco({
  defaultText,
  setText,
  getToken,
  submit,
}: MonacoProps) {
  const [text, setTextInternal] = useState(defaultText);
  const handleUpdate = (value?: string) => {
    if (value) {
      setTextInternal(value);
    }
  };
  const debouncedText = useDebounce(text, 200);
  useEffect(() => {
    (async () => {
      if (debouncedText !== defaultText) {
        setText(debouncedText);
        const token = await getToken();
        if (token) {
          submit(
            {
              content: debouncedText,
            },
            { method: "POST", encType: "application/json" },
          );
        }
      }
    })();
  }, [debouncedText, setText, getToken, defaultText, submit]);
  function handleOnMount(_editor: object, monaco: M) {
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
      command: null,
    });
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH,
      command: null,
    });
  }
  return (
    <MonacoEditor
      defaultLanguage="markdown"
      defaultValue={text}
      theme="vs-dark"
      options={{
        minimap: {
          enabled: false,
        },
      }}
      onChange={handleUpdate}
      onMount={handleOnMount}
    />
  );
}
