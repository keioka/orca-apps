import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Tab, TabView, ActivityIndicator } from 'react-native-paper';
import * as Speech from 'expo-speech';
import Ionicons from '@expo/vector-icons/Ionicons';
import PreviewMaterial from './PreviewMaterial';
import { Text } from './Text';

export const CardVocab = ({
  vocab: {
    word,
    meaning,
    example,
    pronounce,
    translation,
    sentence,
    material
  },
  onClickSave,
  isSaved,
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
  },
  isSaved?: boolean,
  onClickSave?: () => void
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePressSpeak = () => {
    if (isSpeaking) {
      Speech.stop()
      setIsSpeaking(false)
      return
    }

    Speech.speak(word, {
      volume: 1,
      language: 'en',
      pitch: 1,
      rate: 0.75,
      voice: 'com.apple.ttsbundle.Samantha-compact',
      onStart: () => {
        setIsSpeaking(true)
      },
      onDone: () => {
        setIsSpeaking(false)
      },

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

          <TouchableOpacity onPress={handlePressSpeak} disabled={isSpeaking}>
            {!isSpeaking && <View style={styles.buttonSpeak}>
              <Ionicons name="volume-medium-outline" size={18} color="#242424" />
            </View>}
          </TouchableOpacity>

        </View>
        <View style={styles.sectionMeaning}>
          <Text style={styles.meaningTrans} weight='Bold'>{translation ? translation[0].content : null}</Text>
          <Text style={styles.meaning}>{meaning}</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <View style={styles.sectionExample}>
            <Text style={styles.subtitle} weight='Bold'>Sentence</Text>
            <Text style={styles.sentence} weight='Medium' italic>"{example}"</Text>
          </View>
          <View style={styles.sectionExample}>
            <Text style={styles.subtitle} weight='Bold'>Example</Text>
            <Text style={styles.meaning}>{sentence}</Text>
          </View>
        </View>

        {
          material && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.subtitle} weight='Bold'>Source</Text>
              <PreviewMaterial material={material} />
            </View>
          )
        }
      </Card.Content>

      <Card.Actions style={styles.cardContent}>
        {!!onClickSave &&
          <Button
            style={{
              backgroundColor: isSaved ? "#fff" : "#f4f4f4",
              borderColor: isSaved ? "#FFD744" : "#d4d4d4",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onClickSave}
            disabled={isSaved}
          >
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={16} color={isSaved ? "#FFD744" : "#242424"} />
            <Text>{isSaved ? "Saved" : "Save"}</Text>
          </Button>
        }
        {/* <Button textColor='#545454' style={{ backgroundColor: "#f4f4f4", borderColor: "#d4d4d4" }}>Back to the original</Button> */}
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
    elevation: 0,
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
