import { formatDate } from "~/utils/formatter";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FiMoreVertical } from "react-icons/fi";
import { type Note as N } from "~/schema";
import Spinner from "./Spinner";
import { Form, Link, useNavigation, useParams } from "react-router";

export const docStyle =
  "bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-900 focus:bg-zinc-800 transition-colors rounded-2xl outline-none";

type NoteProp = {
  document: N;
  link: string;
};

export default function Note({ document, link }: NoteProp) {
  const { username } = useParams();
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
          <PopoverButton className="cursor-pointer outline-none hover:bg-zinc-700 p-2 rounded-md">
            <FiMoreVertical />
          </PopoverButton>
          <PopoverPanel
            anchor={{
              to: "bottom",
            }}
            className="flex flex-col items-stretch bg-zinc-700 rounded-md p-2 gap-2 min-w-32 shadow-md"
          >
            <Form action={`/${username}/note/${document.id}`} method="delete">
              <button
                className="flex w-full justify-center cursor-pointer"
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
