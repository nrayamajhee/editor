import type { Meta, StoryObj } from "@storybook/react-vite";
import Card from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  decorators: [
    (Story) => {
      return (
        <div className="mx-auto w-96 grid place-items-center p-4">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Card Title",
    subtitle: "This is a subtitle for the card component",
    children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
};
