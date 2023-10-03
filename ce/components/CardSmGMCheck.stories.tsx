import type { Story } from "@ladle/react";
import { CardSmGMCheck } from "./CardSmGMCheck";

const item = {
  text: "The original text",
  suggestions: [
    {
      suggestion: "The suggestion"
    }
  ]
}

export const Simple: Story = () => (
  <CardSmGMCheck item={item} />
);