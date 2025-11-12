import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRoutesStub } from "react-router";
import NoteLink from "./Note";
import type { Note } from "~/schema";

const meta = {
  title: "Components/Note",
  component: NoteLink,
  decorators: [
    (Story) => {
      const RouterStub = createRoutesStub([
        {
          path: "/:username/note/:id",
          Component: () => <Story />,
        },
      ]);

      return (
        <div className="mx-auto w-96 grid place-items-center p-4">
          <RouterStub
            initialEntries={[
              "/johndoe/note/123e4567-e89b-12d3-a456-426614174000",
            ]}
          />
        </div>
      );
    },
  ],
} satisfies Meta<typeof NoteLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNote: Note = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  author_id: "user-123",
  title: "My First Note",
  content:
    "This is the content of my note. It contains some interesting information.",
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-01-15T14:45:00Z",
};

export const Default: Story = {
  args: {
    document: mockNote,
    link: "/johndoe/note/123e4567-e89b-12d3-a456-426614174000",
  },
};
