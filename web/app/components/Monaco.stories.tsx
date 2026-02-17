import type { Meta, StoryObj } from "@storybook/react-vite";
import Monaco from "./Monaco";

const meta = {
  title: "Components/Monaco",
  component: Monaco,
  decorators: [
    (Story) => {
      return (
        <div className="h-[500px] w-full border border-zinc-700 rounded-lg overflow-hidden">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Monaco>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultText: "# Hello Monaco\n\nThis is a markdown editor.",
    setText: () => {},
    getToken: async () => "mocked-token",
    submit: () => new Promise((resolve) => resolve()),
  },
};
