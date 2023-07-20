import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Tab, TabView, ActivityIndicator } from 'react-native-paper';
import { BsArrowRightCircleFill, BsArrowLeftCircleFill } from 'react-icons/bs'; // Note: you need to find alternative icons that work with React Native, react-icons won't work

/**
 * {
        "text": "wrld",
        "type": "Unknown word: wrld",
        "offset": 6,
        "length": 4,
        "suggestions": [
          {
            "suggestion": "world",
            "score": null
          },
          {
            "suggestion": "wild",
            "score": null
          },
          {
            "suggestion": "wold",
            "score": null
          },
          {
            "suggestion": "weld",
            "score": null
          },
          {
            "suggestion": "WRLD",
            "score": null
          }
        ]
      },
 */

interface GrammarFixSuggestion {
  suggestion: string;
  score: number;
}

export interface GrammarFix {
  text: string;
  type: string;
  offset: number;
  length: number;
  suggestions: GrammarFixSuggestion[];
}

export const ContentGrammar = ({
  data: {
    text,
    items
  },
}: {
  data: {
    text: string;
    items: GrammarFix[];
  }
}) => {
  return (
    <View>
      <Text style={styles.textSentence}>
        {text}
      </Text>
      {items.map((item, index) => (
        <View style={styles.sectionFix}>
          <Text style={styles.texTitle}>
            Mistake: {index + 1}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.text}>
              {text.substring(0, item.offset)}
            </Text>
            <Text style={styles.textWrong}>
              {text.substring(item.offset, item.offset + item.length)}
            </Text>
            <Text style={styles.text}>
              {text.substring(item.offset + item.length + 1)}
            </Text>
          </View>

          <Text style={styles.sectionReason}>
            {item.type}
          </Text>
          <View style={styles.sectionSuggestion}>
            <Text style={styles.subtitle}>
              Suggestions
            </Text>
            {
              item.suggestions && item.suggestions.map((suggestion) =>
                <View style={styles.rowSuggestion}>
                  <Text>
                    {suggestion.suggestion}
                  </Text>
                </View>
              )
            }
          </View>


        </View>
      ))}
      <View style={styles.sectionContext}>
        <Text style={styles.subtitle}>
          Context
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textSentence: {
    fontSize: 18,
    marginBottom: 16
  },
  textWrong: {
    color: "red",
  },
  texTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#b4b4b4"
  },
  sectionSuggestion: {
    marginTop: 16,
  },
  sectionReason: {
    marginVertical: 8
  },
  sectionContext: {
    marginVertical: 8
  },
  sectionFix: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    paddingBottom: 16,
    paddingTop: 16
  },
  rowSuggestion: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
});
