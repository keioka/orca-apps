import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Card, Button } from 'react-native-paper';
import axios from 'axios';
import { CardBase } from '../styles/card'
import LoadingDots from "react-native-loading-dots";
import * as Speech from 'expo-speech';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchParaphrases } from '../redux/features/messages';
import { saveParaphrase, fetchSavedParaphrases } from '../redux/features/note';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchTranslation } from '../redux/features/messages';
import { Text } from './Text';
import { analytics, ACTION } from '../helpers/mixpanel';
import { Audio } from 'expo-av';
import { i18n } from '../locales';

const blacklist = [
  "Possible Wrong Punctuation"
]

// Proxied through our own API so the provider key never ships in the app bundle.
async function grammarCheck({ text, language = 'en' }) {
  const res = await axios.post(`${process.env.EXPO_PUBLIC_API_ROOT}/api/gmCheck`, {
    sentence: text,
    provider: 'prowritingaid',
    language
  })

  return res.data
}

function getSentences(paragraph: string) {
  if (!paragraph) return []
  var regex = /(?<=[.!?]|[.!?]["'\])])(?:\s+(?=[A-Z0-9"\(]))|(?:\s+(?=(?:https?:\/\/|www\.)\S+[.!?]["'\])]))/g;
  const sentences = paragraph.split(regex);
  return sentences || [paragraph];
  return []
}


enum Tools {
  Grammar = 'Grammar',
  Paraphrase = 'Paraphrase'
}

export const CardMessage = ({
  message,
  loading,
  minimal
}: {
  message: {
    id: string;
    content: string;
    type: string;
  },
  loading?: boolean,
  minimal?: boolean
}) => {
  const dispatch = useAppDispatch()
  const isFetchingParaphrases = useAppSelector(state => state.message.isFetchingParaphrases)
  const paraphraseMap = useAppSelector(state => state.message.paraphraseMap[message.id] || {})
  const translation = useAppSelector(state => state.message.translationMap[message.id])
  const isFetchingTranslation = useAppSelector(state => state.message.isFetchingTranslation)
  const allSavedParaphrases = useAppSelector(state => state.note.paraphrases)
  const [selectedToolTab, setSelectedToolTab] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  // const [paraphrases, setParaphrases] = useState({})

  const [gmChecks, setGMChecks] = useState({})
  const [loadingGMChecks, setLoadingGMChecks] = useState(false)
  const isOpenPanel = selectedToolTab !== null;

  useEffect(() => {
    if (!message.content && loading) return
    if (message.type === "user") return
    const speak = () => {
      console.log("------- speak -------------")
      Speech.speak(message.content, {
        language: 'en',
        pitch: 0.75,
        rate: 0.75,
        voice: 'com.apple.speech.voice.Alex	'
      });
    };

    // speak()
  }, [message])

  const savedParaphraseIds = useMemo(() => {
    return allSavedParaphrases.filter(p => parseInt(p.paraphrase.sentence.message.id) === parseInt(message.id)).map(p => p.paraphrase.id)
  }, [allSavedParaphrases])

  const messageSentences = useMemo(() => {
    if (!message.content) return []
    return getSentences(message.content)
  }, [message.content])

  const currentSentence = useMemo(() => {
    return messageSentences[currentSentenceIndex]
  }, [messageSentences, currentSentenceIndex])

  const numSentences = useMemo(() => {
    return messageSentences.length
  }, [messageSentences])

  const currentParaphrases = useMemo(() => {
    return paraphraseMap[currentSentenceIndex]
  }, [currentSentence, paraphraseMap])

  const currentGMChecks = useMemo(() => {
    return gmChecks[currentSentence]
  }, [currentSentence, gmChecks])

  async function checkParaphrase({ text }: { text: string }) {
    if (paraphraseMap && paraphraseMap[currentSentenceIndex]) {
      return
    }
    dispatch(fetchParaphrases({ messageId: message.id, sentence: text, sentenceIndex: currentSentenceIndex }))
  }

  async function checkGMCheck({ text }: { text: string }) {
    if (gmChecks && gmChecks[text]) {
      return
    }
    setLoadingGMChecks(true)
    const res = await grammarCheck({ text })
    if (!res.gmCheck) {
      console.error(res)
      return
    }

    const newGMChecks = {
      ...gmChecks,
      [text]: res.gmCheck
    }

    setGMChecks(newGMChecks)
    setLoadingGMChecks(false)
  }

  const handleClickParaphrase = async () => {
    analytics.track(ACTION.showParaphrase)
    const currentSentence = messageSentences[currentSentenceIndex]
    checkParaphrase({ text: currentSentence })
    setSelectedToolTab(Tools.Paraphrase)
  }

  const handleClickNextParaphrase = () => {
    const nextIndex = currentSentenceIndex + 1
    setCurrentSentenceIndex(nextIndex)
    const nextSentence = messageSentences[nextIndex]
    checkParaphrase({ text: nextSentence })
  }

  const handleClickPrevParaphrase = () => {
    const prevIndex = currentSentenceIndex - 1
    setCurrentSentenceIndex(prevIndex)
    const prevSentence = messageSentences[prevIndex]
    checkParaphrase({ text: prevSentence })
  }

  const handleClickGMCheck = async () => {
    const currentSentence = messageSentences[currentSentenceIndex]
    checkGMCheck({ text: currentSentence })
    setSelectedToolTab(Tools.Grammar)
  }

  const handleClickNextGMCheck = () => {
    const prevIndex = currentSentenceIndex + 1
    setCurrentSentenceIndex(prevIndex)
    const prevSentence = messageSentences[prevIndex]
    checkGMCheck({ text: prevSentence })
  }

  const handleClickPrevGMCheck = () => {
    const prevIndex = currentSentenceIndex - 1
    setCurrentSentenceIndex(prevIndex)
    const prevSentence = messageSentences[prevIndex]
    checkGMCheck({ text: prevSentence })
  }

  const handleSaveParaphrase = (paraphraseId: number) => {
    analytics.track(ACTION.saveParaphrase)
    dispatch(saveParaphrase({ paraphraseId }))
  }

  const handlePressSpeak = async () => {
    analytics.track(ACTION.replayAudio)
    if (Platform.OS === "ios") {
      // https://stackoverflow.com/questions/61949934/expo-speech-not-working-on-some-ios-devices/62331403#62331403
      const soundObject = new Audio.Sound();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      await soundObject.loadAsync({
        uri: message.audioFile.path
      })
      await soundObject.playAsync()
    }
  };

  const handleTranslate = async () => {
    analytics.track(ACTION.showTranslation)
    dispatch(fetchTranslation({ messageId: message.id, text: message.content }))
  }

  return (
    <View style={[styles.box, minimal && { flexDirection: "row" }, { alignSelf: message.type === 'ai' ? 'flex-start' : 'flex-end' }]}>
      {!minimal && <Text style={styles.messageRole}>{message.type === 'ai' ? 'AI Tutor' : 'You'}</Text>}
      <Card
        mode="outlined"
        style={[
          styles.card,
          minimal && { flex: 11 },
          { backgroundColor: message.type === 'ai' ? '#DFEDF2' : '#fff' }
        ]}
      >
        <Card.Content
          style={[styles.cardContent, {
            borderBottomWidth: message.type === 'ai' ? 0 : 1,
          }]}>
          {loading &&
            <View style={{ width: 60 }}>
              <LoadingDots dots={3} size={12} bounceHeight={6} colors={["#9FD1D5", "#9FD1D5", "#9FD1D5"]} />
            </View>
          }
          {messageSentences.map((sentence, index) => (
            <Text
              key={index}
              style={[
                styles.messageText,
                minimal && { fontSize: 12 },
                { backgroundColor: isOpenPanel && index === currentSentenceIndex ? '#FFD744' : 'transparent' },
              ]}
            >
              {sentence}{' '}
            </Text>
          ))}
        </Card.Content>
        {!minimal && message.type === 'ai' && (
          <Card.Actions style={{ width: "100%", flexDirection: "column" }}>
            <View style={{ width: "100%", flexDirection: "row" }}>
              <TouchableOpacity onPress={handlePressSpeak} >
                <View style={styles.buttonSpeak}>
                  <Ionicons name="volume-medium-outline" size={18} color="#242424" />
                  <Text style={{ fontSize: 10 }}>{i18n.t("playSound")}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTranslate} >
                <View style={styles.buttonSpeak}>
                  <Ionicons name="language-outline" size={18} color="#242424" />
                  <Text style={{ fontSize: 10 }}>{i18n.t("translation")}</Text>
                </View>
              </TouchableOpacity>
            </View>
            {(isFetchingTranslation || translation) &&
              <View style={{ paddingVertical: 18 }}>
                {isFetchingTranslation && (
                  <Text>
                    Loading
                  </Text>
                )}
                {translation && (

                  <Text>
                    {translation}
                  </Text>
                )}
              </View>
            }
          </Card.Actions>
        )}
        {message.type === 'user' && (
          <Card.Actions style={{ width: "100%", flexDirection: "column" }}>
            <View style={styles.buttonGroup}>
              <Button
                style={[selectedToolTab === Tools.Grammar && styles.activeButton, styles.button]}
                textColor={selectedToolTab === Tools.Grammar ? '#fff' : '#000'}
                onPress={handleClickGMCheck}
              >
                {i18n.t("checkGrammarMistake")}
              </Button>
              <Button
                style={[selectedToolTab === Tools.Paraphrase && styles.activeButton, styles.button]}
                textColor={selectedToolTab === Tools.Paraphrase ? '#fff' : '#242424'}
                onPress={handleClickParaphrase}
              >
                {i18n.t("checkParaphrase")}
              </Button>
            </View>
            {selectedToolTab === Tools.Grammar &&
              <GrammarPanel
                currentSentence={currentSentence}
                numSentences={numSentences}
                currentSentenceIndex={currentSentenceIndex}
                currentGMChecks={currentGMChecks}
                handleClickNextGMCheck={handleClickNextGMCheck}
                handleClickPrevGMCheck={handleClickPrevGMCheck}
                loading={loadingGMChecks}
              />}
            {selectedToolTab === Tools.Paraphrase &&
              <ParaphrasePanel
                numSentences={numSentences}
                currentSentenceIndex={currentSentenceIndex}
                currentParaphrases={currentParaphrases}
                loadingParaphrase={isFetchingParaphrases}
                handleClickNextParaphrase={handleClickNextParaphrase}
                handleClickPrevParaphrase={handleClickPrevParaphrase}
                handleSave={handleSaveParaphrase}
                savedParaphraseIds={savedParaphraseIds}
              />}

            {isOpenPanel &&
              <View style={grammarPanelStyle.navigation}>
                <Button
                  disabled={currentSentenceIndex === 0}
                  onPress={handleClickPrevGMCheck}
                >
                  <Ionicons name="arrow-back-circle-outline" size={21} color="lightgray" />
                </Button>
                <Text>
                  {currentSentenceIndex + 1} / {numSentences}
                </Text>
                <Button
                  disabled={currentSentenceIndex === numSentences - 1}
                  onPress={handleClickNextGMCheck}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={21} color="lightgray" />
                </Button>
              </View>}
          </Card.Actions>
        )}
      </Card>
      {minimal && message.type === 'ai' && (
        <View style={{ width: "100%", flexDirection: "column", flex: 2, justifyContent: "space-between", alignItems: "flex-end" }}>
          <TouchableOpacity onPress={handlePressSpeak} >
            <View style={styles.buttonSpeakSmall}>
              <Ionicons name="volume-medium-outline" size={16} color="#242424" />
              <Text style={{ fontSize: 8 }}>{i18n.t("playSound")}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTranslate} >
            <View style={styles.buttonSpeakSmall}>
              <Ionicons name="language-outline" size={16} color="#242424" />
              <Text style={{ fontSize: 8 }}>{i18n.t("translation")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View >
  );
};

interface Paraphrase {
  //   content: "Hi"
  // createdAt: "2023-10-29T00:15:03.279Z"
  // id: 56
  // sentenceId: 2
  // type: "default"
  // updatedAt: "2023-10-29T00:15:03.279Z"
  id: number,
  sentenceId: number,
  type: string,
  content: string,
  createdAt: string,
  updatedAt: string,
}

interface ParaphrasePanelProps {
  numSentences: number,
  currentSentenceIndex: number,
  currentParaphrases?: Paraphrase[],
  loadingParaphrase: boolean,
  handleClickNextParaphrase: () => void,
  handleClickPrevParaphrase: () => void,
}

const paraphrasePanelStyles = StyleSheet.create({
  container: {
    // flex: 1,
    width: "100%"
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    backgroundColor: '#f4f4f4',
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentenceCounter: {
    marginHorizontal: 10,
  },
});

const ParaphrasePanel: React.FC<ParaphrasePanelProps> = ({
  numSentences,
  currentParaphrases = [],
  currentSentenceIndex,
  handleClickNextParaphrase,
  handleClickPrevParaphrase,
  handleSave,
  loadingParaphrase,
  savedParaphraseIds
}) => {
  return (
    <View style={paraphrasePanelStyles.container}>
      {loadingParaphrase && (
        <View style={paraphrasePanelStyles.loadingContainer}>
          <ActivityIndicator animating size="large" />
        </View>
      )}
      {currentParaphrases.slice(0, 3).map((paraphrase, index) => {
        const isAlreadyAdded = savedParaphraseIds.includes(paraphrase.id)
        return (
          <View style={paraphrasePanelStyles.cardContainer} key={index}>
            <Text style={{ flex: 7 }}>{paraphrase.content}</Text>
            <View style={{ flex: 1, flexDirection: "column", alignItems: "center" }}>
              <Button onPress={() => handleSave(paraphrase.id)}>
                <Ionicons name="bookmark" size={20} color={isAlreadyAdded ? "#FFD744" : "lightgray"} />
              </Button>
              <Text style={{ fontSize: 10 }}>{isAlreadyAdded ? i18n.t("saved") : i18n.t("save")}</Text>
            </View>
          </View>
        )
      })}
    </View>
  );
};


const styles = StyleSheet.create({
  box: {
    padding: 12,
  },
  messageRole: {
    color: '#2FABE8',
    fontSize: 14,
  },
  card: {
    ...CardBase,
    borderRadius: 12,
    // maxWidth: 480,
    minWidth: "100%",
    width: '100%',
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
    borderColor: '#f4f4f4',
  },
  cardContent: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    boxShadow: '0px 0px 5px 0px rgba(0,0,0,0)',
  },
  buttonGroup: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 8,
    // alignItems: "center",
  },
  button: {
    padding: 0,
    borderRadius: 32,
  },
  activeButton: {
    backgroundColor: '#2FABE8',
    color: '#fff',
  },
  messageText: {
    fontSize: 16,
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
    marginRight: 8,
    justifyContent: 'center',
  },
  buttonSpeakSmall: {
    backgroundColor: "#f4f4f4",
    borderColor: "#d4d4d4",
    borderWidth: 1,
    borderRadius: 32,
    width: 32,
    height: 32,
    padding: 0,
    alignItems: 'center',
    marginRight: 8,
    justifyContent: 'center',
  },
  // ... Add more styles
});

interface GMCheck {
  offset: number;
  length: number;
  type: string;
  suggestions: Array<{ suggestion: string }>;
}

interface GrammarPanelProps {
  currentSentence: string;
  numSentences: number;
  currentSentenceIndex: number;
  setCurrentSentenceIndex?: (index: number) => void;
  currentGMChecks?: GMCheck[];
  handleClickNextGMCheck: () => void;
  handleClickPrevGMCheck: () => void;
  loading: boolean;
}

const GrammarPanel: React.FC<GrammarPanelProps> = ({
  currentSentence,
  numSentences,
  currentGMChecks = [],
  currentSentenceIndex,
  handleClickNextGMCheck,
  handleClickPrevGMCheck,
  loading,
}) => {
  return (
    <View style={grammarPanelStyle.container}>
      {/* {loading && <ActivityIndicator animating={true} />} */}

      {!loading && currentGMChecks.length === 0 && (
        <Text style={grammarPanelStyle.text}>Perfect! No grammar errors found.</Text>
      )}

      {currentGMChecks.map((gmCheck, index) => (
        <View style={grammarPanelStyle.card} key={index}>
          <Text style={grammarPanelStyle.caption}>Mistake {index + 1}</Text>
          <Text>
            {currentSentence.substring(0, gmCheck.offset)}
            <Text style={grammarPanelStyle.highlightedText}>
              {currentSentence.substring(gmCheck.offset, gmCheck.offset + gmCheck.length)}
            </Text>
            {" "}
            {currentSentence.substring(gmCheck.offset + gmCheck.length + 1)}
          </Text>
          <View style={grammarPanelStyle.suggestionContainer}>
            <Text style={grammarPanelStyle.caption}>Reason: </Text>
            <Text>{gmCheck.type}</Text>
          </View>
          <View style={grammarPanelStyle.suggestionContainer}>
            <Text style={grammarPanelStyle.caption}>Fix:</Text>
            {gmCheck.suggestions.map((suggestion, index) => (
              <Text key={index} style={grammarPanelStyle.suggestion}>
                {suggestion.suggestion}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const grammarPanelStyle = StyleSheet.create({
  container: {
    width: '100%',
    padding: 8,
    backgroundColor: "#f4f4f4"
  },
  card: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
    // backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
  highlightedText: {
    backgroundColor: '#ffcbcb',
  },
  suggestionContainer: {
    marginTop: 8,
  },
  suggestion: {
    backgroundColor: '#b7ddb7',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default GrammarPanel;