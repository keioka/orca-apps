import type { Story } from "@ladle/react";
import { CardVocab } from "./CardVocab";

const vocab = {
  example: "I used to work as a teacher, but now I'm a writer.",
  meaning: "previous or past",
  pronounce: "ˈfɔːrmər",
  sentence: "Cassidy Hutchinson, the former Trump White House aide",
  transJaByContext: "以前の",
  word: "former"
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
  <CardVocab vocab={vocab} />
);