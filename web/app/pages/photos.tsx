import { getAuth } from "@clerk/react-router/server";
import { get, postForm } from "~/utils/query";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "~/schema";
import Spinner from "~/ui/Spinner";
import { FiCamera } from "react-icons/fi";
import { Form, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/photos";
import toast from "react-hot-toast";
import FileDrop from "~/components/FileDrop";

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  const photos = await get("/photos", token ?? "");
  return { photos };
}

export async function action(args: Route.ActionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (token && args.request.method === "POST") {
    const formData = await args.request.formData();
    const file = formData.get("photo") as File;
    if (file.size > 1024 * 1024 * 5) {
      return { message: "File size must be less than 5MB", type: "error" };
    }
    try {
      const result = await postForm("/photos", token, formData);
      return { type: "success", message: result };
    } catch (e) {
      return {
        type: "error",
        message: (e as Error)?.message ?? undefined,
      };
    }
  }
}

export default function Photos() {
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.type === "error") {
      toast.error(actionData?.message);
    }
    setUploading(false);
  }, [actionData]);
  const { photos } = useLoaderData<typeof loader>();
  const handleDrop = (files: FileList) => {
    if (inputRef.current && formRef.current) {
      setUploading(true);
      inputRef.current.files = files;
      formRef.current.submit();
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch  py-8 px-4 relative">
      <FileDrop onDrop={handleDrop} uploading={uploading} style="ghost" />
      {photos.map((photo: Photo) => (
        <img
          key={photo.name}
          className="aspect-square object-cover min-h-full"
          src={`${import.meta.env.VITE_R2_URL}/${photo.name}`}
        />
      ))}
      <Form method="post" encType="multipart/form-data" ref={formRef}>
        <input
          onChange={() => formRef.current?.submit()}
          type="file"
          id="picUpload"
          name="photo"
          hidden
          ref={inputRef}
        />
        <label
          htmlFor="picUpload"
          className="aspect-square min-h-full bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors outline-none flex items-center justify-center gap-2 p-4 cursor-pointer"
        >
          {uploading ? (
            <Spinner />
          ) : (
            <>
              <FiCamera />
              <span>Upload</span>
            </>
          )}
        </label>
      </Form>
    </div>
  );
}
