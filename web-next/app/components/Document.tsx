import { formatDate } from "~/utils/formatter";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FiMoreVertical } from "react-icons/fi";
import { Document as Doc } from "schema";
import { Form, Link, useNavigation } from "@remix-run/react";
import Spinner from "./Spinner";

export const docStyle =
  "bg-zinc-700/50 hover:bg-zinc-700/80 active:bg-zinc-700/60 focus:bg-zinc-700/80 transition-colors rounded-2xl outline-none";

type DocumentProp = {
  document: Doc;
  link: string;
};

export default function Document({ document, link }: DocumentProp) {
  const navigation = useNavigation();
  return (
    <Link to={link} className={docStyle}>
      <div className="p-6 flex flex-cols items-end">
        <div className="flex flex-col gap-2 flex-1">
          <p className="font-semibold text-xl">{document.title}</p>
          <p className="font-medium text-sm">
            {formatDate(document.updated_at)}
          </p>
        </div>
        <Popover className="relative">
          <PopoverButton className="outline-none focus:bg-zinc-600 hover:bg-zinc-600 p-2 rounded-md">
            <FiMoreVertical />
          </PopoverButton>
          <PopoverPanel
            anchor={{
              to: "bottom",
            }}
            className="flex flex-col items-stretch bg-zinc-700 rounded-md p-2 gap-2 min-w-32 shadow-md"
          >
            <Form action={`/document/${document.id}`} method="DELETE">
              <button
                className="flex gap-2 items-center"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {navigation.state === "loading" ? (
                  <Spinner />
                ) : (
                  <>Delete document</>
                )}
              </button>
            </Form>
          </PopoverPanel>
        </Popover>
      </div>
    </Link>
  );
}
