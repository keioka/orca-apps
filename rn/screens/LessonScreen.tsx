import { useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Image, KeyboardAvoidingView, Keyboard } from 'react-native';
import { CardMessage } from '../components/CardMessage';
import { CardSummary } from '../components/CardSummary';
import { CardVocab, CardVocabXS } from '../components/CardVocab';
import { WebView } from 'react-native-webview';
import { TextInput, Card } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { vocab } from '../helpers/dummy';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { LoadingStatus } from '../redux/types';
import { fetchLesson } from '../redux/features/lessons';
import { fetchMessages, createMessage, addMessage } from '../redux/features/messages';
import { messages as messageDummy } from '../helpers/dummy'
import { Audio } from "expo-av";
import { TalkMode } from '../components/TalkMode';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { fetchCaptions } from '../redux/features/videoInfo';


enum LearningModeTab {
  Article = 'article',
  Summary = 'summary',
  Vocabulary = 'vocabulary',
}

const levels = [
  'Beginner (A1)',
  'Elementary (A2)',
  'Intermediate (B1)',
  'Upper Intermediate (B2)',
  'Advanced (C1)',
  'Proficient (C2)'
]

function SummaryTab() {
  const [tabLevel, setTabLevel] = useState(levels[0])
  return (
    <>
      <View style={{ height: 64, paddingHorizontal: 4, paddingTop: 24, width: "100%" }}>
        <ScrollView
          style={{ flexGrow: 1, }}
          contentContainerStyle={{ flexGrow: 1, }}
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          {
            levels.map((level) =>
              <TouchableOpacity style={{ marginHorizontal: 16, }} onPress={() => setTabLevel(level)}>
                <View style={[{ borderRadius: 32, padding: 8, height: 32 }, level === tabLevel ? { backgroundColor: "#007991" } : null]}>
                  <Text style={{ color: level === tabLevel ? "#fff" : null }}>{level}</Text>
                </View>
              </TouchableOpacity>
            )
          }
        </ScrollView >
      </View >
      <ScrollView
        style={{
          flexGrow: 1,
          width: "100%"
        }}
        contentContainerStyle={styles.summaryView}
      >

        <View style={styles.section}>
          <Text style={styles.subtitleKeyPoints}>Summary</Text>
          <CardSummary
            content={`
The United States has carried out air strikes in eastern Syria on sites connected to Iran-backed groups. 
The Pentagon said the strikes targeted facilities used by Iranian-backed militia groups linked to recent attacks against US interests in Iraq.
          `}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitleKeyPoints}>Key points</Text>
          <CardSummary
            points={
              [
                {
                  content: "The United States has carried out air strikes in eastern Syria on sites connected to Iran-backed groups.",
                  trans: "アメリカ合衆国は、イランを支援するグループに関連する東シリアのサイトで空爆を行った。",
                },
                {
                  content: "The Pentagon said the strikes targeted facilities used by Iranian-backed militia groups linked to recent attacks against US interests in Iraq.",
                  trans: "ペンタゴンは、空爆がイラクでの最近の米国の利益に対する攻撃に関連するイラン支援の民兵グループが使用した施設を標的としていると述べた。",
                }, {
                  content: "The strikes mark the first military action undertaken by the Biden administration, which has been pledging to reduce the US's military footprint in the Middle East.",
                  trans: "空爆は、中東における米国の軍事的存在を削減することを誓ってきたバイデン政権が行った最初の軍事行動を示している。",
                }
              ]
            }
          />
        </View>
      </ScrollView >
    </>
  )
}

function VocabularyTab() {
  return (
    <ScrollView
      style={{ height: "100%" }}
      contentContainerStyle={styles.vocabularyView}
      showsVerticalScrollIndicator={false}
    >
      {vocab.map((item, index) => (
        <View style={styles.cardWrapper}>
          <CardVocab vocab={item} />
        </View>
      ))}
    </ScrollView>
  )
}

function LearningMode({ onPressToggle, lesson, }: { onPressToggle: () => void, lesson: {} }) {
  const [tab, setTab] = useState(LearningModeTab.Article)
  const dispatch = useAppDispatch()
  const captions = useAppSelector(state => {
    if (!lesson.material) return []
    const materialId = lesson.material.id
    if (!state.videoInfo.captions[materialId]) return []
    return state.videoInfo.captions[materialId]
  })

  useEffect(() => {
    if (!lesson.material) return
    dispatch(fetchCaptions({ materialId: lesson.material.id }))
  }, [lesson.id])

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <View style={styles.menu}>
        <View style={[styles.tabWrapper]}>
          <TouchableOpacity onPress={() => setTab(LearningModeTab.Article)}>
            <View style={[styles.button, tab === LearningModeTab.Article ? styles.buttonActive : null]}>
              <Text style={[styles.textMenu, tab === LearningModeTab.Article ? { color: "#242424" } : null]}>Article</Text>
            </View>
          </TouchableOpacity >
        </View>
        <View style={[styles.tabWrapper]}>
          <TouchableOpacity onPress={() => setTab(LearningModeTab.Summary)}>
            <View style={tab === LearningModeTab.Summary ? styles.buttonActive : null}>
              <Text style={[styles.textMenu, tab === LearningModeTab.Summary ? { color: "#242424" } : null]}>Summary</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={[styles.tabWrapper]}>
          <TouchableOpacity onPress={() => setTab(LearningModeTab.Vocabulary)}>
            <View style={tab === LearningModeTab.Vocabulary ? styles.buttonActive : null}>
              <Text style={[styles.textMenu, tab === LearningModeTab.Vocabulary ? { color: "#242424" } : null]}>Vocabulary</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {tab === LearningModeTab.Article &&
        <>
          {lesson.material.type === "video" ? <View style={{ flexGrow: 1 }}>
            <WebView
              originWhitelist={['*']}
              source={{ uri: lesson.material.url }}
              style={styles.youtubeWebview}
            />
            <ScrollView
              style={{
                flex: 1,
                height: "100%",
                width: "100%",
                padding: 16,
              }}
              contentContainerStyle={{
                flexGrow: 1,
                width: "100%",
                paddingBottom: 32,
              }}
            >
              {captions.map((caption) => (
                <View style={{
                  backgroundColor: "#fff",
                  height: 64,
                  marginVertical: 8,
                  padding: 16,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    width: "100%",
                  }}>
                    {caption.offset}: {caption.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View> : <WebView
            originWhitelist={['*']}
            source={{ uri: lesson.material.url }}
            style={styles.webview}
            menuItems={[{ label: 'Tweet', key: 'tweet' }, { label: 'Save for later', key: 'saveForLater' }]}
          />}
        </>
      }
      {
        tab === LearningModeTab.Summary && (
          <SummaryTab />
        )
      }
      {
        tab === LearningModeTab.Vocabulary && (
          <VocabularyTab />
        )
      }
      <TouchableOpacity onPress={onPressToggle}>
        <View
          style={styles.switch}
        >
          <Button onPress={onPressToggle}>
            Go to {Mode.Talk} Mode
          </Button>
        </View>
      </TouchableOpacity >
    </View >
  )
}

enum Mode {
  Learning = 'Learning',
  Talk = 'Talk',
}

export function LessonScreen({ route }) {
  const [mode, setMode] = useState(Mode.Learning)
  const dispatch = useAppDispatch()
  const lessonId = route.params.lessonId
  const lessons = useAppSelector(state => { return state.lessons.lessons })
  const lesson = useAppSelector(state => { return state.lessons.lessons.find((lesson) => lesson.id === lessonId) })

  const onPressToggle = () => setMode(mode === Mode.Learning ? Mode.Talk : Mode.Learning)

  useEffect(() => {
    dispatch(fetchLesson(lessonId))
    dispatch(fetchMessages(lessonId))
  }, [])


  if (!lesson || !lesson.material) {
    return null
  }

  return (
    <View style={styles.container}>
      {mode === Mode.Learning ? <LearningMode onPressToggle={onPressToggle} lesson={lesson} /> : <TalkMode onPressToggle={onPressToggle} lesson={lesson} />}
    </View>
  );
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
  youtubeWebview: {
    flex: 1,
    flexGrow: 1,
    width: "100%",
    // height: 240,
    maxHeight: 240,

  },
  switch: {
    width: "100%",
    flexGrow: 1,
    height: 64,
    // position: 'absolute',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchButton: {
    height: 48,
    borderRadius: 48,
    backgroundColor: '#9FD1D5',
    borderWidth: 0,
    color: "#fff",
    alignItems: 'center',
    justifyContent: 'center',
    width: "90%",
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
