import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Tab, TabView, ActivityIndicator } from 'react-native-paper';
import { BsArrowRightCircleFill, BsArrowLeftCircleFill } from 'react-icons/bs'; // Note: you need to find alternative icons that work with React Native, react-icons won't work
import axios from 'axios';
import * as Speech from 'expo-speech';
import Icon from 'react-native-vector-icons/AntDesign';

// ... (All other constant declarations and async functions remain the same)

const locale = {
  detail: {
    en: "Detail",
    ja: "詳細"
  },
  rephrase: {
    en: "Rephrase",
    ja: "言い換え表現"
  },
  grammar: {
    en: "Grammar",
    ja: "文法チェック"
  },
  mistake: {
    en: "Mistake",
    ja: "間違い"
  },
  reason: {
    en: "Reason",
    ja: "理由"
  },
  fix: {
    en: "Fix",
    ja: "修正提案"
  }
}

export const CardVocab = ({
  vocab: {
    word,
    meaning,
    example,
    pronounce,
    translation,
    sentence
  },
  onClickSave,
}: {
  vocab: {
    word: string;
    meaning: string;
    meaningTrans: string;
    example: string;
    sentence: string;
    image: string;
    pronounce: string;
    translation: {
      content: string;
    }
  }
}) => {
  const handlePressSpeak = () => {
    console.log("------- speak -------------")
    Speech.speak(word, {
      language: 'en',
      pitch: 1,
      rate: 0.75,
      voice: 'com.apple.ttsbundle.Samantha-compact'
    });
  };


  return (
    <Card style={[styles.cardBase, styles.card]}>
      <Card.Content style={styles.cardContent}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={styles.vocab}>{word}</Text>
            <Text>{pronounce}</Text>
          </View>

          <TouchableOpacity onPress={handlePressSpeak} >
            <View style={styles.buttonSpeak}>
              <Icon name="sound" size={18} color="#242424" />
            </View>
          </TouchableOpacity>

        </View>
        <View style={styles.sectionMeaning}>
          <Text style={styles.meaningTrans}>{translation ? translation[0].content : null}</Text>
          <Text style={styles.meaning}>{meaning}</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={styles.sectionExample}>
            <Text style={styles.subtitle}>Sentence</Text>
            <Text style={styles.sentence}>{example}</Text>
          </View>
          <View style={styles.sectionExample}>
            <Text style={styles.subtitle}>Example</Text>
            <Text style={styles.meaning}>{sentence}</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardContent}>
        {!!onClickSave && <Button textColor='#545454' style={{ backgroundColor: "#f4f4f4", borderColor: "#d4d4d4" }} onPress={onClickSave}>Save</Button>}
        <Button textColor='#545454' style={{ backgroundColor: "#f4f4f4", borderColor: "#d4d4d4" }}>Back to the original</Button>
      </Card.Actions>
    </Card>
  );
};

export const CardVocabXS = ({
  vocab: {
    word,
    meaning,
    meaningTrans,
    example,
    pronunce
  },
}: {
  vocab: {
    word: string;
    meaning: string;
    meaningTrans: string;
    example: string;
    image: string;
    pronunce: string;
  }
}) => {
  return (
    <Card style={[styles.cardBase, styles.cardXS]}>
      <Card.Content style={styles.cardContentXS}>
        <Text style={styles.vocabXS}>{word}</Text>
        {/* <Text>{pronunce}</Text> */}

        {/* <View style={styles.sectionMeaning}>
          <Text style={styles.meaning}>{meaning}</Text>
          <Text style={styles.meaning}>{meaningTrans}</Text>
        </View>
        <View style={styles.sectionExample}>
          <Text style={styles.subtitle}>Example</Text>
          <Text style={styles.meaning}>{example}</Text>
        </View> */}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    elevation: 0,
    shadowOpacity: 0,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  card: {
    width: '100%',
    // border: '1px solid #f4f4f4',
    paddingVertical: 24
  },
  cardContent: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#f4f4f4',
  },
  buttonSpeak: {
    backgroundColor: "#f4f4f4",
    borderColor: "#d4d4d4",
    borderWidth: 1,
    borderRadius: 48,
    width: 48,
    height: 48,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vocab: {
    fontSize: 24,
  },
  meaningTrans: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sentence: {
    fontSize: 16,
    marginTop: 8,
    fontVariant: 'italic'
  },
  meaning: {
    fontSize: 16,
    marginTop: 8,
  },
  sectionMeaning: {
    marginTop: 16,
  },
  sectionExample: {
    marginTop: 16,
  },
  subtitle: {
    fontWeight: 'bold',
    color: '#a4a4a4',
  },
  cardXS: {
    padding: 0
  },
  vocabXS: {
    fontSize: 12,
  },
  cardContentXS: {
    // padding: ,
  }
  // ... Add more styles
});
