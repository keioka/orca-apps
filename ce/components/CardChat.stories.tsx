import { useState } from "react";
import type { Story } from "@ladle/react";
import { CardChatPure } from "./CardChat";
import type { CardChatPureProps } from "./CardChat";

const gmCheck = {
  original: "I used to work as a teacher, but now I'm a writer.",
  suggestion: "I used to work as a teacher, but now I'm a writer.",
}

enum Tab {
  Paraphrase = "paraphrase",
  GMCheck = "gmcheck"
}

window.chrome = {
  i18n: {
    getMessage: (label: string) => {
      switch (label) {
        case "chat_card_button_gm_check":
          return "GM Check";
        case "chat_card_button_paraphrase":
          return "Paraphrase";
        case "chat_card_paraphrase_loading":
          return "Sentence";
        case "chat_card_gmcheck_loading":
          return "Example";
        default:
          return label;
      }
    }
  }
}

const paraphrase = [{
  suggestion: "I used to work as a teacher, but now I'm a writer.",
}]

const sampleProps: CardChatPureProps = {
  type: "human",
  loading: false,
  handleClickTranslate: (sentence: string) => console.log("Translating:", sentence),
  handlePlayAudio: () => console.log("Playing audio"),
  handleSaveGMCheck: (suggestions: string[]) => console.log("Saved GM Check:", suggestions),
  handleSaveParaphrase: (suggestionSentence: string) => console.log("Saved Paraphrase:", suggestionSentence),
  translate: "Bonjour",
  isLoadingGMCheck: false,
  isLoadingParaphrase: false,
  paraphrase: {
    0: [
      { sentence: "I used to work as a teacher, but now I'm a writer." },
      { sentence: "I used to work as a teacher, but now I'm a writer." },
      { sentence: "I used to work as a teacher, but now I'm a writer." },
    ],
  },
  gmCheck: {
    0: [
      {
        text: "I used to work as a teacher, but now I'm a writer.",
        suggestions: [
          { suggestion: "I used to work as a teacher, but now I'm a writer. I used to work as a teacher, but now I'm a writer. I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
        ]
      },
      {
        text: "I used to work as a teacher, but now I'm a writer.",
        suggestions: [
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
        ]
      },
    ]
  },
  currentSentenceIndex: 0,
  numSentences: 5,
  messageSentences: [
    "Hello, how are you?",
    "I'm doing well, thank you!",
    "That's great to hear.",
    "How's your day going?",
    "It's going well, thanks!"
  ],
  selectNextSentence: () => console.log("Selected next sentence"),
  selectPreviousSentence: () => console.log("Selected previous sentence")
}

export const Test: Story = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(null)
  const handleClickGMCheck = () => setCurrentTab(Tab.GMCheck)
  const handleClickParaphrase = () => setCurrentTab(Tab.Paraphrase)

  return (
    <CardChatPure
      {...sampleProps}
      setCurrentTab={setCurrentTab}
      currentTab={currentTab}
      handleClickGMCheck={handleClickGMCheck}
      handleClickParaphrase={handleClickParaphrase}
    />
  )
}

const sampleAIProps: CardChatPureProps = {
  type: "ai",
  loading: false,
  handleClickTranslate: (sentence: string) => console.log("Translating:", sentence),
  handlePlayAudio: () => console.log("Playing audio"),
  handleSaveGMCheck: (suggestions: string[]) => console.log("Saved GM Check:", suggestions),
  handleSaveParaphrase: (suggestionSentence: string) => console.log("Saved Paraphrase:", suggestionSentence),
  translate: "Bonjour",
  isLoadingGMCheck: false,
  isLoadingParaphrase: false,
  paraphrase: {
    0: [
      { sentence: "I used to work as a teacher, but now I'm a writer." },
      { sentence: "I used to work as a teacher, but now I'm a writer." },
      { sentence: "I used to work as a teacher, but now I'm a writer." },
    ],
  },
  gmCheck: {
    0: [
      {
        text: "I used to work as a teacher, but now I'm a writer.",
        suggestions: [
          { suggestion: "I used to work as a teacher, but now I'm a writer. I used to work as a teacher, but now I'm a writer. I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
        ]
      },
      {
        text: "I used to work as a teacher, but now I'm a writer.",
        suggestions: [
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
          { suggestion: "I used to work as a teacher, but now I'm a writer." },
        ]
      },
    ]
  },
  currentSentenceIndex: 0,
  numSentences: 5,
  messageSentences: [
    "Hello, how are you?",
    "I'm doing well, thank you!",
    "That's great to hear.",
    "How's your day going?",
    "It's going well, thanks!"
  ],
  selectNextSentence: () => console.log("Selected next sentence"),
  selectPreviousSentence: () => console.log("Selected previous sentence")
}
export const AITest: Story = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(null)
  const handleClickGMCheck = () => setCurrentTab(Tab.GMCheck)
  const handleClickParaphrase = () => setCurrentTab(Tab.Paraphrase)

  return (
    <CardChatPure
      {...sampleAIProps}
      setCurrentTab={setCurrentTab}
      currentTab={currentTab}
      handleClickGMCheck={handleClickGMCheck}
      handleClickParaphrase={handleClickParaphrase}
    />
  )
}