import { useState, useEffect, useMemo, useRef, Component } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, KeyboardAvoidingView, Keyboard } from 'react-native';
import { CardSummary } from '@/components/CardSummary';
import { CardVocab, CardVocabXS } from '@/components/CardVocab';
import { WebView } from 'react-native-webview';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLesson } from '../redux/features/lessons';
// import { Button } from '@/components/Button';
import { TextInput, Card, Button, Modal, Portal, Snackbar } from 'react-native-paper';
import { fetchVocabs, createVocabs, fetchSummaries, fetchOriginalMaterial } from '../redux/features/materials';
import { utc } from 'moment';
import { ActivityIndicator } from 'react-native';
import { saveVocab } from '../redux/features/note';
import { createSelector } from 'reselect';
import { Text } from '@/components/Text';
import { Browser } from '@/components/Browser';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchSavedVocab, clearIsSavedVocab, clearErrorSaveVocab } from '../redux/features/note';
import { i18n } from '../locales';
import LottieView from 'lottie-react-native';
import { analytics, ACTION } from '../helpers/mixpanel';
import { TalkModeEmbed } from '@/components/TalkModeEmbed';
import { WordCounter } from '@/components/WordCounter';
import { CardMessage } from '@/components/CardMessage';
import { fetchMessages, createAIMessage, addUserMessage, sendWhisper } from '../redux/features/messages';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';

enum LearningModeTab {
  Article = 'article',
  Summary = 'summary',
  Vocabulary = 'vocabulary',
}

const levels = ['5Y', 'K5', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const levelsMap = {
  '5Y': i18n.t("5Y"),
  K5: i18n.t("K5"),
  A1: i18n.t("A1"),
  A2: i18n.t("A2"),
  B1: i18n.t("B1"),
  B2: i18n.t("B2"),
  C1: i18n.t("C1"),
  C2: i18n.t("C2"),
}


function VocabularyTab({ materialId }: { materialId: string }) {
  const dispatch = useAppDispatch()
  // const [intervalID, setIntervalID] = useState<Timer>(null)
  const intervalID = useRef<Timer | null>(null)
  // Step 1: Create input selectors
  const getMaterialsState = state => state.material;
  const getMaterialId = (state, materialId) => materialId;

  // Step 2: Create the memoized selector using createSelector
  const selectVocabsByMaterialId = createSelector(
    [getMaterialsState, getMaterialId],
    (materials, materialId) => materials.vocabs[materialId] || []
  );

  const vocabs = useAppSelector(state => selectVocabsByMaterialId(state, materialId));
  const isFetchingVocabs = useAppSelector(state => state.material.isFetchingVocabs)
  const savedVocabs = useAppSelector(state => state.note.vocabularies)
  const isSavedVocab = useAppSelector(state => state.note.isSavedVocab)
  const errorSaveVocab = useAppSelector(state => state.note.errors.saveVocabulary)

  useEffect(() => {
    if (vocabs && vocabs.length > 0) return

    dispatch(createVocabs({ materialId }))

    const interval = setInterval(() => {
      console.log("fetchVocabsInterval")
      dispatch(fetchVocabs({ materialId }))
    }, 5000)

    intervalID.current = interval

    return () => {
      clearInterval(intervalID.current);
    }
  }, [])

  const handleClickSave = (vocab) => {
    analytics.track(ACTION.saveVocab, { vocab: vocab.id })
    dispatch(saveVocab({ vocabId: vocab.id }))
  }

  const isSavedMap = useMemo(() => {
    const map = {}
    savedVocabs.forEach((vocab) => {
      map[vocab.vocabularyId] = true
    })
    return map
  }, [savedVocabs])

  const onDismissSnackBar = () => {
    dispatch(clearIsSavedVocab())
  }

  const onClearError = () => {
    dispatch(clearErrorSaveVocab())
  }

  return (
    <>
      <Snackbar
        visible={isSavedVocab}
        onDismiss={onDismissSnackBar}
        elevation={5}
      >
        Saved
      </Snackbar>
      <Snackbar
        visible={!!errorSaveVocab}
        onDismiss={onClearError}
      >
        {typeof errorSaveVocab === "string" ? errorSaveVocab : "Error"}
      </Snackbar>
      <ScrollView
        style={{ height: "100%", elevation: 2, paddingBottom: 48 }}
        contentContainerStyle={styles.vocabularyView}
        showsVerticalScrollIndicator={false}
      >

        {vocabs && vocabs.map((item, index) => {
          return (
            <View key={`vocab_${item.id}`} style={styles.cardWrapper}>
              <CardVocab vocab={item} onClickSave={() => handleClickSave(item)} isSaved={isSavedMap[item.id]} />
            </View>
          )
        })}
        {isFetchingVocabs && vocabs.length === 0 && (
          <View style={{ width: "100%", alignItems: 'center', justifyContent: 'center' }}>
            <LottieView
              source={{ uri: "https://lottie.host/f5d3cdb1-d14c-4e57-9287-df6f93f302af/1yKt5SJGbU.json" }}
              autoPlay
              loop
              style={{
                width: 400,
                height: 300,
              }}
            />
            <Text style={{ marginTop: 16 }} weight='Bold'>{i18n.t("creatingVocabulary")}</Text>
            <Text style={{ marginTop: 16 }}>{i18n.t("creatingVocabularyTime")}</Text>
          </View>
        )}

      </ScrollView>
    </>
  )
}

function LearningMode({ onPressToggle, lesson, currentOpenedMaterial }: { onPressToggle: () => void, lesson: {} }) {
  const [tab, setTab] = useState(LearningModeTab.Article)
  const dispatch = useAppDispatch()
  const [showHistory, setShowHistory] = useState(false)
  const messages = useAppSelector(state => { return state.message.messageMap[lesson.id] || [] })
  const [message, setMessage] = useState()
  // Step 1: Create input selectors
  const getMaterialsState = state => state.material;
  const getMaterialId = (state, materialId) => materialId;
  const isCreatingMessage = useAppSelector(state => { return state.message.creatingMessage })

  // Step 2: Create the memoized selector using createSelector
  const selectVocabsByMaterialId = createSelector(
    [getMaterialsState, getMaterialId],
    (materials, materialId) => materials.vocabs[materialId] || []
  );

  const material = lesson.material
  const materialId = material.id
  const isOriginalContent = Boolean(material.externalId)
  const vocabs = useAppSelector(state => selectVocabsByMaterialId(state, materialId));

  useEffect(() => {
    dispatch(fetchSavedVocab())
    dispatch(fetchVocabs({ materialId }))
    if (isOriginalContent || vocabs.length > 0) return
    dispatch(createVocabs({ materialId: materialId }))
  }, [])


  const count = useMemo(() => {
    return messages.filter((message) => message.type === "user").reduce((acc, message) => {
      return acc + message.content.split(" ").length
    }, 0)
  }, [])

  const lastMessage = useMemo(() => {
    if (!messages || messages.length === 0) return null
    return messages.filter((message) => message.type === "ai").pop()
  }, [messages])


  useEffect(() => {
    async function play() {
      const soundObject = new Audio.Sound();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      await soundObject.loadAsync({
        uri: lastMessage.audioFile.path
      })
      await soundObject.playAsync()
    }
    play()
  }, [lastMessage])


  const handlePressSummary = () => {
    analytics.track(ACTION.navLessonSummaryTab, { lessonId: lesson.id })
    setTab(LearningModeTab.Summary)
  }

  const handlePressVocabulary = () => {
    analytics.track(ACTION.navLessonVocabTab, { lessonId: lesson.id })
    setTab(LearningModeTab.Vocabulary)
  }

  const handleToggleHistory = () => {
    setShowHistory(!showHistory)
  }


  const submitMessage = () => {
    if (!message) return
    if (!lesson) {
      console.error("No lesson")
    }

    dispatch(addUserMessage({ message, lessonId: lesson.id }))
    dispatch(createAIMessage({ message, lessonId: lesson.id }))
    setMessage(null)
    Keyboard.dismiss()
    analytics.track(ACTION.submitMessage, { lessonId: lesson.id })
  }

  const handleSetMessage = (message) => {
    console.log({ message })
    setMessage(message)
  }

  if (!currentOpenedMaterial) {
    return null
  }

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "#fff" }}>
      <ScrollView style={{ padding: 24, paddingBottom: 96 }}>
        <View style={{ marginBottom: 24, display: "flex", flexDirection: "row", borderBottom: "1px solid #f4f4f4" }}>
          <View style={{ flex: 2, paddingRight: 8 }}>
            <Image
              style={{ width: "100%", height: 72 }}
              source={{ uri: material.imageUrl }}
            />
          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ marginBottom: 8 }}>{currentOpenedMaterial.content.titleJa}</Text>
            <Text style={{ fontSize: 12 }}>{currentOpenedMaterial.content.title}</Text>
          </View>
        </View>
        <View style={{ marginBottom: 24 }}>
          <Text>{currentOpenedMaterial.content.p1}</Text>
          {/* <Text>{currentOpenedMaterial.content.p1Ja}</Text> */}
        </View>
        <View style={{ marginBottom: 24 }}>
          <Text>{currentOpenedMaterial.content.p2}</Text>
          {/* <Text>{currentOpenedMaterial.content.p2Ja}</Text> */}
        </View>
        <View style={{ marginBottom: 24 }}>
          <Text>{currentOpenedMaterial.content.p3}</Text>
          {/* <Text>{currentOpenedMaterial.content.p3Ja}</Text> */}
        </View>
      </ScrollView>


      {showHistory &&
        <View style={{ height: "100%", width: "100%", position: "absolute" }}>
          <History messages={messages} isCreatingMessage={isCreatingMessage} />
        </View>
      }


      {/* <View style={{ flex: 1, height: "100%", width: "100%", position: "absolute", bottom: 0, left: 0, right: 0 }} > */}
      <InputChat
        lastMessage={lastMessage}
        handleSetMessage={handleSetMessage}
        message={message}
        submitMessage={submitMessage}
        handleToggleHistory={handleToggleHistory}
      />
      {/* </View> */}
      <View
        style={{
          position: 'absolute',
          bottom: "50%",
          right: 0,
        }}>
        <WordCounter count={count} />
      </View>
    </View>
  )
}

function History({ messages, isCreatingMessage }: { messages: any[] }) {
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!scrollViewRef.current) return
    scrollViewRef.current.scrollToEnd({ animated: true })
  }, [messages.length])

  return (
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
          <CardMessage
            loading
            message={{
              content: "",
              type: "ai",
            }}
          />
        )
      }
    </ScrollView>
  )
}


enum Mode {
  Learning = 'Learning',
  Talk = 'Talk',
}

export function LessonOriginalScreen({ route, navigation }) {
  const dispatch = useAppDispatch()

  console.log({ "params": route.params })

  const lessonId = route.params.lessonId
  const lesson = useAppSelector(state => { return state.lesson.lessons.find((lesson) => lesson.id === lessonId) })
  const currentOpenedMaterial = useAppSelector((state) => state.material.currentOpenedMaterial)

  const onPressToggle = () => navigation.navigate('Talk', { lessonId })

  useEffect(() => {
    dispatch(fetchOriginalMaterial({ externalId: lesson.material.externalId }))
    dispatch(fetchLesson(lessonId))
    dispatch(fetchMessages(lessonId))
  }, [])

  if (!lesson || !lesson.material) {
    return null
  }

  return (
    <View style={styles.container}>
      <LearningMode onPressToggle={onPressToggle} lesson={lesson} currentOpenedMaterial={currentOpenedMaterial} />
    </View>
  );
}


class InputChat extends Component {

  state: Readonly<{
    openTextInput: boolean;
    openRecordingModal: boolean;
    isRecording: boolean;
  }>;
  constructor(props) {
    super(props);
    this.state = {
      helper: null,
      openRecordingModal: false,
      openTextInput: false,
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
    if (this.state.isRecording) {
      this.onEndButtonPress()
      this.props.submitMessage()
      return
    }
    this.onStartButtonPress()
  }

  onPressToggleTextInput = () => {
    this.setState({ openTextInput: !this.state.openTextInput })
  }

  onStartButtonPress = () => {
    analytics.track(ACTION.startRecording)
    this.setState({ isRecording: true })
    Voice.start('en-US');
  }

  onEndButtonPress() {
    analytics.track(ACTION.endRecording)
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
    return (
      <>
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
              <View>
                {this.props.lastMessage && <CardMessage message={this.props.lastMessage} minimal />}
              </View>
              <View style={styles.footer}>
                <View style={styles.buttonInputMenu}>
                  <TouchableOpacity onPress={this.onPressToggleTextInput}>
                    <View style={{ backgroundColor: "#242424", width: 48, height: 48, borderRadius: 48, alignItems: "center", justifyContent: "center" }}>
                      {true ? <Ionicons name="pencil" size={18} color="#fff" /> : <Ionicons name="mic" size={18} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                </View>
                {!this.state.openTextInput && <View style={styles.buttonInputMenu}>
                  <TouchableOpacity onPress={this.onPressMic}>
                    <View style={{ backgroundColor: "#FF8A60", width: 48, height: 48, borderRadius: 48, alignItems: "center", justifyContent: "center" }}>
                      {this.state.isRecording ? <Ionicons name="square" size={18} color="#fff" /> : <Ionicons name="mic" size={18} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                </View>}
                {this.state.openTextInput &&
                  <View
                    style={[styles.textInputWrapper]}
                  >
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
                }
                <View style={styles.buttonInputMenu}>
                  <TouchableOpacity onPress={this.props.handleToggleHistory}>
                    <View style={{ backgroundColor: "#242424", width: 48, height: 48, borderRadius: 48, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
                    </View>
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

const styles = StyleSheet.create({
  menu: {
    padding: 4,
    height: 64,
    width: 64,
    backgroundColor: '#2852A4',
    color: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonInputMenu: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 4,
  },
  menuTalkMode: {
    width: "100%",
    backgroundColor: '#fff',
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%",
  },
  button: {
    padding: 2,
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonTalkMode: {
    color: "#fff",
  },
  buttonActive: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 8,
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
    height: "100%",
    paddingBottom: 128,
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
  textInputWrapper: {
    flex: 8,
    // width: "90%",
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: "row",
    height: 48,
    // paddingLeft: 42,
    // paddingRight: 42,
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
  youtubeWebview: {
    flex: 1,
    flexGrow: 1,
    width: "100%",
    // height: 240,
    maxHeight: 240,

  },
  footer: {
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  switch: {
    position: 'absolute',
    bottom: 0,
    width: "100%",
    flexGrow: 1,
    height: 64,
    // position: 'absolute',
    backgroundColor: '#2FABE8',
    alignItems: 'center',
    justifyContent: 'center',
    color: "#fff",
  },
  summaryView: {
    flexGrow: 1,
    paddingBottom: 64,
    alignItems: 'center',
  },
  vocabularyView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 48,
  },
  cardWrapper: {
    width: "90%",
    marginBottom: 8,
    elevation: 2,
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
