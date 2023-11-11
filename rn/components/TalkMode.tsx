import { useState, useEffect, useMemo, useRef, Component } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, KeyboardAvoidingView, Keyboard } from 'react-native';
import { CardMessage } from './CardMessage';
import { CardVocab, CardVocabXS } from './CardVocab';
// import { WebView } from 'react-native-webview';
import { TextInput, Card, Modal, Portal, Button, } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { vocab } from '../helpers/dummy';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { LoadingStatus } from '../redux/types';
import { fetchMessages, createAIMessage, addUserMessage, sendWhisper } from '../redux/features/messages';
import { useAudio } from '../hooks/audio';
import { transcribeAudio } from '../redux/features/transcribe'
import { fetchSavedParaphrases } from '../redux/features/note';
import { Audio } from 'expo-av';
import Voice from '@react-native-voice/voice';
import { Text } from './Text';
import * as Speech from 'expo-speech';

enum TalkHelper {
  Vocab = 'vocab',
  Phrase = 'phrase',
  WhatToSay = 'whatToSay',
}

enum Mode {
  Learning = 'learning',
  Talk = 'talk',
}

const apiUrl = process.env.EXPO_PUBLIC_API_ROOT;

async function getMetadata(url: string) {
  try {
    const response = await fetch(`${apiUrl}/api/metatag?${new URLSearchParams({ url })}`,
      {
        method: 'GET',
      });
    const result = await response.json();
    return result
  } catch (error) {
    console.error(error);
  }
}


class InputChat extends Component {

  state: Readonly<{}>;
  constructor(props) {
    super(props);
    this.state = {
      helper: null,
      openRecordingModal: false,
      isRecording: false,
    }
    Voice.onSpeechStart = this.onSpeechStartHandler.bind(this);
    Voice.onSpeechEnd = this.onSpeechEndHandler.bind(this);
    Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
    this.setOpenRecordingModal = this.setOpenRecordingModal.bind(this)
    this.onPressMic = this.onPressMic.bind(this)
    this.onStartButtonPress = this.onStartButtonPress.bind(this)
    this.onEndButtonPress = this.onEndButtonPress.bind(this)
    this.onClear = this.onClear.bind(this)
    this.onClose = this.onClose.bind(this)
  }

  onStartButtonPress(e) {
    Voice.start('en-US');
  }

  onSpeechStartHandler(e) {
    console.log('onSpeechStart: ', e);
  }

  onSpeechEndHandler(e) {

  }

  onSpeechResultsHandler(e) {
    this.props.handleSetMessage(e.value[0])
  }

  setHelper = (helper) => {
    this.setState({ helper })
  }

  setOpenRecordingModal = (openRecordingModal: boolean) => {
    this.setState({ openRecordingModal })
  }

  onPressMic = () => {
    this.setState({ openRecordingModal: true })
    // startRecording()
  }

  onStartButtonPress = (e) => {
    this.setState({ isRecording: true })
    Voice.start('en-US');
  }

  onEndButtonPress(e) {
    this.setState({ isRecording: false })
    Voice.stop();
    this.setOpenRecordingModal(false)
  }

  onClear() {
    this.props.handleSetMessage(null)
  }

  onClose() {
    this.setOpenRecordingModal(false)
  }

  render() {
    console.log("message", this.props.message)
    return (
      <>
        <Portal>
          <Modal
            visible={this.state.openRecordingModal}
            onDismiss={this.onEndButtonPress}
            contentContainerStyle={{
              backgroundColor: 'white',
              padding: 20,
              margin: 20,
              borderRadius: 20,
              height: 300,
            }}
          >
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <View style={{ backgroundColor: "#f4f4f4", padding: 16, width: "100%", borderRadius: 8, marginBottom: 24 }}>
                <Text>{this.props.message ? this.props.message : "Press red button and talk"}</Text>
              </View>
              <TouchableOpacity
                onPress={this.state.isRecording ? this.onEndButtonPress : this.onStartButtonPress}>
                <View style={{ width: 64, height: 64, borderRadius: 64, backgroundColor: "red", justifyContent: "center", alignItems: "center" }}>
                  {this.state.isRecording ? <Ionicons name={"square"} size={32} color="#fff" /> : <View style={{ width: 32, height: 32, borderRadius: 32, backgroundColor: "#fff" }} />}
                </View>
              </TouchableOpacity>
              <Button
                onPress={this.onClear}
                textColor='#242424'
                style={{
                  marginTop: 16,
                  backgroundColor: '#f4f4f4',
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#242424" />
                <Text>Clear input</Text>
              </Button>
              <Button
                onPress={this.onClose}
                textColor='#242424'
                style={{
                  marginTop: 16,
                  backgroundColor: '#f4f4f4',
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="close" size={16} color="#242424" />
                <Text>Close</Text>
              </Button>
            </View>
          </Modal>
        </Portal>
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={64} contentContainerStyle={{ borderTopColor: "#f4f4f4", borderTopWidth: 1 }}>
          <>
            {this.state.helper && (
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 64,
                  backgroundColor: "#fff",
                  flexDirection: "column",
                  flexGrow: 1,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f4f4f4",
                  width: "100%",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "bold", color: "lightgray" }}>Saved vocabs</Text>
                <ScrollView horizontal style={{ backgroundColor: "#fff", paddingVertical: 12 }}>
                  {vocab.map((vocab) => <View style={{ marginRight: 8, backgroundColor: "#fff", }}><CardVocabXS vocab={vocab} /></View>)}
                </ScrollView>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <TouchableOpacity onPress={() => this.setHelper(null)}>
                    <Ionicons name="chevron-down-outline" size={24} color="lightgray" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

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


              <View style={styles.footer}>
                <View
                  style={[styles.textInputWrapper]}
                >
                  <TouchableOpacity onPress={this.onPressMic}>
                    <Ionicons name="mic" size={24} color="#FF8A60" />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.messageTextInput]}
                    // multiline
                    dense
                    mode="flat"
                    underlineColor='transparent'
                    selectionColor='#9FD1D5'
                    activeUnderlineColor='transparent'
                    value={this.props.message}
                    onChangeText={(value) => {
                      this.props.handleSetMessage(value)
                    }}
                  />
                  <TouchableOpacity onPress={this.props.submitMessage} disabled={this.props.disabledSubmit}>
                    <Ionicons name="send" size={21} color="#2FABE8" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        </KeyboardAvoidingView>
      </>
    )
  }
}

export function TalkMode({ onPressToggle, lesson }: { onPressToggle: () => void, lesson: {} }) {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(state => { return state.message.messageMap[lesson.id] || [] })
  const [message, setMessage] = useState()
  const { startRecording, stopRecording, file, fileURI } = useAudio();
  const isAddingMessage = useAppSelector(state => { return state.message.addingMessage })
  const isCreatingMessage = useAppSelector(state => { return state.message.creatingMessage })

  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!lesson.initMessage && messages.length === 0) {
      dispatch(createAIMessage({ message: "Ask me a question about the news.", lessonId: lesson.id }))
    }
  }, [])


  useEffect(() => {
    if (file && fileURI) {
      dispatch(sendWhisper({ file, fileURI }))
    }
  }, [file, fileURI])

  useEffect(() => {
    dispatch(fetchSavedParaphrases({}))
  }, [])

  useEffect(() => {
    if (!scrollViewRef.current) return
    scrollViewRef.current.scrollToEnd({ animated: true })
  }, [messages.length])


  useEffect(() => {
    async function speakLastMessage() {
      console.log(">>>>>> speakLastMessage>>>>>>>>")
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage) return
      if (lastMessage.type === "user") return

      const voices = await Speech.getAvailableVoicesAsync()

      let voice = voices.find((voice) => voice.identifier === 'com.apple.ttsbundle.siri_Aaron_en-US_compact')
      if (!voice) {
        voice = voices.find((voice) => voice.identifier === 'com.apple.ttsbundle.Samantha-compact' || voice.identifier === 'com.apple.voice.compact.en-US.Samantha')
      }

      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
        Speech.speak(lastMessage.content, {
          volume: 1,
          language: 'en',
          pitch: 1,
          rate: 0.75,
          voice: voice?.identifier
        });
      } catch (err) {
        console.error(err)
      }
    }

    speakLastMessage()
  }, [messages.length])


  const submitMessage = () => {
    dispatch(addUserMessage({ message, lessonId: lesson.id }))
    dispatch(createAIMessage({ message, lessonId: lesson.id }))
    setMessage(null)
    Keyboard.dismiss()
  }

  const handleSetMessage = (message) => {
    setMessage(message)
  }

  const isTypeVideo = lesson.material.type === "video"
  const disabledSubmit = !message || message === "" || isAddingMessage


  return (
    <View style={{ flex: 1, height: "100%" }}>

      <View style={styles.menuTalkMode}>
        <View style={{ flexDirection: "row", paddingVertical: 8 }}>
          {/* {isTypeVideo ? <WebView
            // style={styles.youtubeView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: lesson.material.url }}
          /> : <Image source={{ uri: newsImageUrl }} style={{ width: 108, height: 108 }} />} */}
          <View
            style={{
              flex: 1,
              width: "100%",
              marginLeft: 8,
              paddingVertical: 8,
              paddingHorizontal: 8,
              // flexWrap: "wrap",
              flexGrow: 1
            }}
          >
            <Text style={styles.menuTalkModeTitle} weight='SemiBold'>{lesson.material.title}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {messages && messages.map((message) => (
            <CardMessage key={message.id} message={message} />
          ))}

          {
            isCreatingMessage && (
              <CardMessage loading
                message={{
                  content: "",
                  type: "ai",
                }} />
            )
          }
        </ScrollView>
      </View>
      <InputChat handleSetMessage={handleSetMessage} message={message} submitMessage={submitMessage} />
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
    backgroundColor: '#2852A4',
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
    backgroundColor: '#f8f8f8',
    height: "100%"
  },
  textInputWrapper: {
    width: "90%",
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: "row",
    height: 64,
    paddingLeft: 42,
    paddingRight: 42,
  },
  messageTextInput: {
    width: '100%',
    borderWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    height: 48,
  },
  menuTalkModeTitle: {
    color: "#fff",
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
  footer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
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
    // backgroundColor: '#f6f6f6',
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
