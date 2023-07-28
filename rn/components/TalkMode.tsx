import { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Image, KeyboardAvoidingView, Keyboard } from 'react-native';
import { CardMessage } from '../components/CardMessage';
import { CardVocab, CardVocabXS } from '../components/CardVocab';
import { WebView } from 'react-native-webview';
import { TextInput, Card, Modal, Portal, } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { vocab } from '../helpers/dummy';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { LoadingStatus } from '../redux/types';
import { fetchLesson } from '../redux/features/lessons';
import { fetchMessages, createMessage, addMessage } from '../redux/features/messages';
import { messages as messageDummy } from '../helpers/dummy'
import { Audio } from "expo-av";
import { useAudio } from '../hooks/audio';
import { transcribeAudio } from '../redux/features/transcribe'
import { Button } from './Button';

enum TalkHelper {
  Vocab = 'vocab',
  Phrase = 'phrase',
  WhatToSay = 'whatToSay',
}

enum Mode {
  Learning = 'learning',
  Talk = 'talk',
}

const apiUrl = 'http://localhost:3000';

async function getMetadata(url: string) {
  try {
    const response = await fetch(`${apiUrl}/api/metatag?${new URLSearchParams({ url })}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'REDACTED_RAPIDAPI_KEY',
          'X-RapidAPI-Host': 'og-link-preview.p.rapidapi.com'
        }
      });
    const result = await response.json();
    return result
  } catch (error) {
    console.error(error);
  }
}


export function TalkMode({ onPressToggle, lesson }: { onPressToggle: () => void, lesson: {} }) {
  const [message, setMessage] = useState(null)
  const [helper, setHelper] = useState(null)
  const dispatch = useAppDispatch()
  const messages = useAppSelector(state => { return state.messages.messageMap[lesson.id] })
  const statusCreate = useAppSelector(state => { return state.messages.statusCreate })
  const [newsTitle, setNewsTitle] = useState("Artificial Intelligence");
  const [newsImageUrl, setNewsImageUrl] = useState("https://media.cnn.com/api/v1/images/stellar/prod/230413152030-kim-jong-un-0410.jpg?c=16x9&q=h_540,w_960,c_fill/f_webp");
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const { startRecording, stopRecording, file } = useAudio();
  const [openRecordingModal, setOpenRecordingModal] = useState(false);
  const isAddingMessage = useAppSelector(state => { return state.messages.addingMessage })

  const scrollViewRef = useRef(null);

  const messageConvert = useMemo(() => {
    if (!messages) {
      return []
    }
    return messages.map((item) => {
      return {
        message: item.fullContent,
        role: item.type === "user" ? "user" : "ai",
        createdAt: new Date(item.createdAt)
      }
    })
  }, [messages])


  useEffect(() => {
    async function fetchMetadata() {
      setLoadingMetadata(true)
      try {
        const res = await getMetadata(lesson.material.url)
        if (res) {
          setNewsImageUrl(res.image)
          setNewsTitle(res.title)
        }
        setLoadingMetadata(false)
      } catch (error) {
        console.error(error);
      }
    }
    fetchMetadata()
  }, [])

  const onPressMic = () => {
    setOpenRecordingModal(true)
    startRecording()
  }

  const submitMessage = () => {
    dispatch(addMessage({ message, lessonId: lesson.id }))
    setMessage(null)
    Keyboard.dismiss()
  }

  const handleTranscribe = async (file) => {
    console.log({ file })
    file && dispatch(transcribeAudio(file))
  }

  const isTypeVideo = lesson.material.type === "video"
  return (
    <View style={{ flex: 1, height: "100%" }}>
      <Portal>
        <Modal
          visible={openRecordingModal}
          onDismiss={() => setOpenRecordingModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: 20,
            margin: 20,
            borderRadius: 20,
            height: 300,
          }}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                stopRecording()
                setOpenRecordingModal(false)
                if (file) {
                  handleTranscribe(file)
                }
              }}>
              <View style={{ width: 64, height: 64, borderRadius: 64, backgroundColor: "red", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="square" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
      <View style={styles.menuTalkMode}>
        <View style={{ flexDirection: "row", height: 108 }}>
          {isTypeVideo ? <WebView
            // style={styles.youtubeView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: lesson.material.url }}
          /> : <Image source={{ uri: newsImageUrl }} style={{ width: 108, height: 108 }} />}
          <View
            style={{
              flex: 1,
              width: "100%",
              marginLeft: 8,
              paddingVertical: 16,
              paddingHorizontal: 8,
              // flexWrap: "wrap",
              flexGrow: 1
            }}
          >
            {loadingMetadata ? <Text style={styles.menuTalkModeTitle}>Loading...</Text> : <Text style={styles.menuTalkModeTitle}>{newsTitle || lesson.material.name}</Text>}
          </View>
        </View>
      </View>
      <View
        style={styles.switch}
      >
        <Button onPress={onPressToggle}>Back to learn mode</Button>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          onContentSizeChange={(contentWidth, contentHeight) => {
            scrollViewRef.current.scrollToEnd({ animated: true })
          }}
          showsVerticalScrollIndicator={false}
        >
          {messageConvert.map((item, index) => (
            <CardMessage message={item} />
          ))}

          {
            statusCreate === LoadingStatus.LOADING && <CardMessage loading message={{
              message: "",
              role: "ai",
            }} />
          }
        </ScrollView>
      </View>
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={90}>
        <>
          {helper && <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 32,
              backgroundColor: "#fff",
              flexDirection: "column",
              flexGrow: 1,
              borderBottomWidth: 1,
              borderBottomColor: "#f4f4f4",
            }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: "lightgray" }}>Saved vocabs</Text>
            <ScrollView horizontal style={{ backgroundColor: "#fff", paddingVertical: 12 }}>
              {vocab.map((vocab) => <View style={{ marginRight: 8, backgroundColor: "#fff", }}><CardVocabXS vocab={vocab} /></View>)}
            </ScrollView>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setHelper(null)}>
                <Ionicons name="chevron-down-outline" size={24} color="lightgray" />
              </TouchableOpacity>
            </View>
          </View>
          }

          <View
            style={{
              justifyContent: "center",
              width: "100%",
              paddingTop: 18,
              paddingBottom: 8,
              backgroundColor: "#fff",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                // width: "100%",
                flexGrow: 1,
                paddingHorizontal: 22,
              }}
              contentContainerStyle={{
                flexGrow: 1,
                // width: "100%",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <TouchableOpacity onPress={() => setHelper(TalkHelper.Vocab)}>
                <View style={{ width: 120, height: 32, backgroundColor: "#f4f4f4", borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 4 }}>
                  <Text>
                    Saved vocabs
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHelper(TalkHelper.Phrase)}>
                <View style={{ width: 120, height: 32, backgroundColor: "#f4f4f4", borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 4 }}>
                  <Text>
                    Phrase
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHelper(TalkHelper.WhatToSay)}>
                <View style={{ width: 120, height: 32, backgroundColor: "#f4f4f4", borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 4 }}>
                  <Text>
                    What to say?
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={{ backgroundColor: "#fff", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
              <View
                style={{
                  width: "90%",
                  backgroundColor: '#f4f4f4',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 64,
                  flexDirection: "row",
                  height: 64,
                  paddingLeft: 48,
                  paddingRight: 48,
                }}
              >
                <TouchableOpacity onPress={onPressMic}>
                  <Ionicons name="mic" size={24} color="red" />
                </TouchableOpacity>
                <TextInput
                  style={styles.messageTextInput}
                  multiline
                  mode="flat"
                  underlineColor='transparent'
                  selectionColor='#9FD1D5'
                  activeUnderlineColor='transparent'
                  value={message}
                  onChangeText={(value) => {
                    setMessage(value)
                  }}
                />
                <TouchableOpacity onPress={submitMessage} disabled={!message || message === "" || isAddingMessage}>
                  <Ionicons name="send" size={21} color="#0057D9" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  menu: {
    padding: 8,
    backgroundColor: '#242424',
    color: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuTalkMode: {
    width: "100%",
    backgroundColor: '#fff',
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    padding: 12,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 32,
    alignItems: 'center',
  },
  textMenu: {
    color: "#fff",
  },
  container: {
    position: 'relative',
    flex: 1,
    height: "100%",
  },
  messageContainer: {
    flexGrow: 1,
    backgroundColor: '#f4f4f4',
    height: "100%"
  },
  messageTextInput: {
    width: '100%',
    borderWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginBottom: 12
  },
  menuTalkModeTitle: {
    fontSize: 13,
  },
  menuTalkModeSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    height: 100,
    width: '100%',
    zIndex: 10,
  },
  switch: {
    width: "100%",
    height: 64,
    // position: 'absolute',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryView: {
    flexGrow: 1,
    alignItems: 'center',
  },
  vocabularyView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  section: {
    width: "100%",
    alignItems: 'center',
    marginTop: 32,
  },
  subtitleKeyPoints: {
    textAlign: 'left',
    width: "90%",
    fontSize: 18,
  }
});
