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

export const Variants: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm text-zinc-500">Normal Style</p>
        <FileDrop onDrop={onDrop} uploading={false} style="normal" />
      </div>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm text-zinc-500">Ghost Style (Overlays Content)</p>
        <div className="relative w-96 h-64 bg-zinc-900 rounded-2xl grid place-items-center">
          <p>Drop files anywhere here</p>
          <FileDrop onDrop={onDrop} uploading={false} style="ghost" />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm text-zinc-500">Uploading State</p>
        <FileDrop onDrop={onDrop} uploading={true} style="normal" />
      </div>
    </div>
  ),
};
