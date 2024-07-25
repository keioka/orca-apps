import { Box, Card, CardContent } from "@mui/material"
import React, { useEffect, useState } from "react"

import { CardVocabDetailed } from "./CardVocabDetailed"

const PopupComponent = ({ wordInfo, x, y, onClose }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "300px",
        left: `${x}px`,
        top: `${y}px`,
        zIndex: "100000000"
      }}>
      <CardVocabDetailed
        vocab={wordInfo}
        onSaveVocab={() => {}}
        onClose={onClose}
      />
    </Box>
  )
}

export const InjectVocab = () => {
  const [popupInfo, setPopupInfo] = useState(null)

  console.log("InjectVocab")
  const handleSelectionChange = (event) => {
    console.log("handleSelectionChange", event)
    event.preventDefault()
    event.stopPropagation()

    const selection = window.getSelection()
    const anchorNode = selection.anchorNode

    console.log({ anchorNode })
    if (anchorNode.nodeName !== "#text") {
      return
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length === 0 || selectedText.length > 40) {
      setPopupInfo(null)
      return
    }
    // Remove existing highlights
    const existingHighlights = document.querySelectorAll(
      ".highlight, .sentence-highlight"
    )
    existingHighlights.forEach((highlight) => highlight.remove())

    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Add highlight
      // const highlight = document.createElement("span")
      // highlight.style.backgroundColor = "rgba(255, 255, 0, 0.1)" // yellow with 0.1 opacity
      // highlight.style.position = "absolute"
      // highlight.style.left = `${rect.left + window.scrollX}px`
      // highlight.style.top = `${rect.top + window.scrollY}px`
      // highlight.style.width = `${rect.width}px`
      // highlight.style.height = `${rect.height}px`
      // highlight.classList.add("highlight")
      // document.body.appendChild(highlight)

      // Add green highlight to the sentence containing the hovered word
      const sentenceRange = document.createRange()
      // sentenceRange.selectNodeContents(range.startContainer)
      const sentenceText = sentenceRange
        .toString()
        .trim()
        .split(".")
        .filter((sentence) => sentence.includes(selectedText))[0]

      // const sentenceRect = sentenceRange.getBoundingClientRect()
      // const sentenceHighlight = document.createElement("span")
      // sentenceHighlight.style.backgroundColor = "rgba(0, 255, 0, 0.1)" // green with 0.1 opacity
      // sentenceHighlight.style.position = "absolute"
      // sentenceHighlight.style.left = `${sentenceRect.left + window.scrollX}px`
      // sentenceHighlight.style.top = `${sentenceRect.top + window.scrollY}px`
      // sentenceHighlight.style.width = `${sentenceRect.width}px`
      // sentenceHighlight.style.height = `${sentenceRect.height}px`
      // sentenceHighlight.classList.add("sentence-highlight")
      // document.body.appendChild(sentenceHighlight)

      console.log({
        selectedText,
        sentenceText,
        range,
        sentenceRange
      })

      const wordInfo = {
        word: selectedText,
        meaning: sentenceText,
        example: sentenceText
      }

      setPopupInfo({
        wordInfo,
        x: rect.right + window.scrollX + 5,
        y: rect.top + window.scrollY + 60
      })
    }
  }

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [])

  const handleClosePopup = () => {
    console.log("close popup")
    setPopupInfo(null)
  }

  return (
    <>
      {popupInfo && (
        <PopupComponent
          wordInfo={popupInfo.wordInfo}
          x={popupInfo.x}
          y={popupInfo.y}
          onClose={handleClosePopup}
        />
      )}
    </>
  )
}
