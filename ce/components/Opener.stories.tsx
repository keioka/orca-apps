import type { Story } from "@ladle/react";
import { Opener } from "./Opener";


window.chrome = {
  i18n: {
    getMessage: (label: string) => {
      switch (label) {
        case "opener_label":
          return "Talk";
        default:
          return label;
      }
    }
  }
}

export const Simple: Story = () => (
  <Opener />
);