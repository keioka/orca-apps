import type { Story } from "@ladle/react";
import { CardGMCheck } from "./CardGMCheck";

const gmCheck = {
  original: "I used to work as a teacher, but now I'm a writer.",
  suggestion: "I used to work as a teacher, but now I'm a writer.",
}

window.chrome = {
  i18n: {
    getMessage: (label: string) => {
      switch (label) {
        case "card_vocab_sentence_label":
          return "Sentence";
        case "card_vocab_example_label":
          return "Example";
        default:
          return label;
      }
    }
  }
}

export const Simple: Story = () => (
  <CardGMCheck gmCheck={gmCheck} />
);