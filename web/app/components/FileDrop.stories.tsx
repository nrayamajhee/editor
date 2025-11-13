import type { Meta, StoryObj } from "@storybook/react-vite";
import FileDrop from "./FileDrop";

const meta = {
  title: "Components/FileDrop",
  component: FileDrop,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FileDrop>;

export default meta;
type Story = StoryObj<typeof meta>;

function onDrop(files: FileList) {
  alert(
    "Files dropped:\n" +
      Array.from(files)
        .map((f) => f.name)
        .join("\n"),
  );
}

export const Default: Story = {
  args: {
    onDrop,
    uploading: false,
  },
};

export const Ghost: Story = {
  args: {
    style: "ghost",
    onDrop,
    uploading: false,
  },
};
