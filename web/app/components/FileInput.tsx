import { useRef } from "react";
import Spinner from "~/ui/Spinner";

type FileInputProps = {
  uploading: boolean;
  onFileChange: (files: FileList) => void;
  accept: string;
  label: React.ReactNode;
};

export default function FileInput({
  uploading,
  onFileChange,
  accept,
  label,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files);
    }
  };

  return (
    <>
      <input
        onChange={handleChange}
        type="file"
        id="fileInput"
        accept={accept}
        hidden
        ref={inputRef}
      />
      <label
        htmlFor="fileInput"
        className="bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors outline-none flex items-center justify-center gap-2 px-6 py-4 rounded-lg cursor-pointer"
      >
        {uploading ? <Spinner /> : label}
      </label>
    </>
  );
}
