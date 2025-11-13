import { useState } from "react";
import Spinner from "~/ui/Spinner";
import { FiUpload } from "react-icons/fi";

type FileDropProps = {
  style?: "normal" | "ghost";
  onDrop: (files: FileList) => void;
  uploading: boolean;
  children?: React.ReactNode;
};

export default function FileDrop({
  style = "normal",
  onDrop,
  uploading,
  children,
}: FileDropProps) {
  const [dragging, setDragging] = useState(false);

  const icon = uploading ? (
    <Spinner />
  ) : dragging || style === "normal" ? (
    <FiUpload size="64px" />
  ) : null;
  return (
    <div
      className={
        style == "ghost"
          ? "pointer-events-none absolute w-full h-full top-0 left-0"
          : ""
      }
      onDragEnter={() => setDragging(true)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.files);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
    >
      <div
        className={`grid place-items-center rounded-2xl border-t-2 border-solid transition-all ${
          style === "ghost"
            ? `w-full h-full ${dragging ? "backdrop-blur-xl" : ""}`
            : "bg-zinc-800/50 min-w-96 min-h-64"
        } ${dragging ? "border-t-zinc-700" : "border-t-transparent"}`}
      >
        {icon}
      </div>
      {children}
    </div>
  );
}
