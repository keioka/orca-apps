import { useMemo, useState } from "react";

function getSentences(paragraph: string) {
  var regex = /(?<=[.!?]|[.!?]["'\])])(?:\s+(?=[A-Z0-9"\(]))|(?:\s+(?=(?:https?:\/\/|www\.)\S+[.!?]["'\])]))/g;
  const sentences = paragraph.split(regex);
  return sentences || [paragraph];
}

export function useSentence(content: string) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)

  const messageSentences = useMemo(() => {
    if (!content) return []
    return getSentences(content)
  }, [content])

  const currentSentence = useMemo(() => {
    return messageSentences[currentSentenceIndex]
  }, [messageSentences, currentSentenceIndex])

  const numSentences = useMemo(() => {
    return messageSentences.length
  }, [messageSentences])

  return {
    currentSentence,
    numSentences,
    setCurrentSentenceIndex,
    currentSentenceIndex,
    messageSentences
  }
}