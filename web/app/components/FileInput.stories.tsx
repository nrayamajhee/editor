import type { Meta, StoryObj } from "@storybook/react-vite";
import FileInput from "./FileInput";

const meta = {
  title: "Components/FileInput",
  component: FileInput,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    uploading: false,
    accept: "*",
    label: "Upload File",
    onFileChange: (files: FileList) => {
      console.log("Files selected:", files);
    },
  },
};

export const Uploading: Story = {
  args: {
    uploading: true,
    accept: "*",
    label: "Upload File",
    onFileChange: (files: FileList) => {
      console.log("Files selected:", files);
    },
  },
};

export const CSVOnly: Story = {
  args: {
    uploading: false,
    accept: ".csv",
    label: "Upload CSV",
    onFileChange: (files: FileList) => {
      console.log("CSV files selected:", files);
    },
  },
};

export const ImageOnly: Story = {
  args: {
    uploading: false,
    accept: "image/*",
    label: "Upload Image",
    onFileChange: (files: FileList) => {
      console.log("Image files selected:", files);
    },
  },
};

export const Variants: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm text-zinc-500">Default</p>
        <FileInput
          uploading={false}
          accept="*"
          label="Upload File"
          onFileChange={() => {}}
        />
      </div>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm text-zinc-500">Uploading</p>
        <FileInput
          uploading={true}
          accept="*"
          label="Upload File"
          onFileChange={() => {}}
        />
      </div>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm text-zinc-500">CSV Only</p>
        <FileInput
          uploading={false}
          accept=".csv"
          label="Upload CSV"
          onFileChange={() => {}}
        />
      </div>
    </div>
  ),
};
