import { getAuth } from "@clerk/react-router/server";
import { BiSolidCloudUpload } from "react-icons/bi";
import { get, postForm } from "~/utils/query";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "~/schema";
import Spinner from "~/ui/Spinner";
import { FiCamera } from "react-icons/fi";
import { Form, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/photos";
import toast from "react-hot-toast";

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
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.type === "error") {
      toast.error(actionData?.message);
    }
    setDragging(false);
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
    <div
      className="flex flex-col gap-8 relative min-h-[512px] p-6 md:p-8 [& *]:pointer-events-none"
      onDragEnter={() => setDragging(true)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop(e.dataTransfer.files);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
    >
      <div
        className={`${dragging ? "grid" : "hidden"} absolute bg-white/10 backdrop-blur-md w-full h-full top-0 left-0 rounded-3xl place-items-center`}
      >
        {dragging && uploading ? (
          <Spinner />
        ) : (
          <BiSolidCloudUpload size={128} />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch">
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
          />
          <label
            htmlFor="picUpload"
            className="aspect-square min-h-full bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors outline-none flex items-center justify-center gap-2 p-4 cursor-pointer"
          >
            {!dragging && uploading ? (
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
    </div>
  );
}
