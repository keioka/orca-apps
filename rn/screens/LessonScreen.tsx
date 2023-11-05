import { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image, KeyboardAvoidingView, Keyboard } from 'react-native';
import { CardSummary } from '../components/CardSummary';
import { CardVocab, CardVocabXS } from '../components/CardVocab';
import { WebView } from 'react-native-webview';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLesson } from '../redux/features/lessons';
import { fetchMessages } from '../redux/features/messages';
// import { Button } from '../components/Button';
import { Button, Modal, Portal, Snackbar } from 'react-native-paper';
import { fetchVocabs, createVocabs, fetchSummaries } from '../redux/features/materials';
import { utc } from 'moment';
import { ActivityIndicator } from 'react-native';
import { saveVocab } from '../redux/features/note';
import { createSelector } from 'reselect';
import { Text } from '../components/Text';
import { Browser } from '../components/Browser';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchSavedVocab, clearIsSavedVocab, clearErrorSaveVocab } from '../redux/features/note';

enum LearningModeTab {
  Article = 'article',
  Summary = 'summary',
  Vocabulary = 'vocabulary',
}

const levels = ['K5', '5Y', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const levelsMap = {
  K5: 'Beginner (K5)',
  '5Y': 'Elementary (5Y)',
  A1: 'Beginner (A1)',
  A2: 'Elementary (A2)',
  B1: 'Intermediate (B1)',
  B2: 'Upper Intermediate (B2)',
  C1: 'Advanced (C1)',
  C2: 'Proficient (C2)'
}

function SummaryTab({ materialId }: { materialId: string }) {
  const dispatch = useAppDispatch()
  const summaries = useAppSelector(state => {
    if (!materialId) return []
    if (!state.material.summaries[materialId]) return []
    return state.material.summaries[materialId]
  })
  const isFetchingSummary = useAppSelector(state => state.material.isFetchingSummary)

  const [tabLevel, setTabLevel] = useState(levels[0])

  useEffect(() => {
    if (isFetchingSummary) return
    dispatch(fetchSummaries({ materialId, levels: [levels[0]] }))
  }, [])

  const summary = useMemo(() => {
    return summaries.find((summary) => summary.level === tabLevel)
  }, [tabLevel, summaries])

  const handleOnPress = (level) => {
    setTabLevel(level)
    if (summaries.find((summary) => summary.level === level)) return
    // TODO: Prevent fetch if it is loading depends on level and materialId
    dispatch(fetchSummaries({ materialId, levels: [level] }))
  }

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
              <TouchableOpacity style={{ marginHorizontal: 16, }} onPress={() => handleOnPress(level)}>
                <View style={[{ borderRadius: 32, padding: 8, height: 32 }, level === tabLevel ? { backgroundColor: "#007991" } : null]}>
                  <Text style={{ color: level === tabLevel ? "#fff" : null }}>{levelsMap[level]}</Text>
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
          {summary &&
            <CardSummary
              content={summary.content}
            />
          }
          {isFetchingSummary &&
            <View style={{ width: "100%", height: 240, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#007991" />
            </View>
          }
        </View>
        {/* <View style={styles.section}>
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
        </View> */}
      </ScrollView >
    </>
  )
}

function VocabularyTab({ materialId }: { materialId: string }) {
  const dispatch = useAppDispatch()

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


    return () => {
      clearInterval(interval);
    }
  }, [])

  const handleClickSave = (vocab) => {
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

  console.log({ isSavedVocab, savedVocabs })

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
        style={{ height: "100%", elevation: 2 }}
        contentContainerStyle={styles.vocabularyView}
        showsVerticalScrollIndicator={false}
      >

        {vocabs && vocabs.map((item, index) => {
          const isSaved = savedVocabs.some((vocab) => vocab.vocabularyId == item.id)
          return (
            <View key={`vocab_${item.id}`} style={styles.cardWrapper}>
              <CardVocab vocab={item} onClickSave={() => handleClickSave(item)} isSaved={isSavedMap[item.id]} />
            </View>
          )
        })}
        {isFetchingVocabs && (
          <View style={{ width: "100%", height: 240, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#007991" />
          </View>
        )}

      </ScrollView>
    </>
  )
}

function ArticleTab({ lesson, captions }: { materialId: string }) {
  const [shouldShowBrowser, setShouldShowBrowser] = useState(true)
  const [shouldEmbed, setShouldEmbed] = useState(true)

  return (
    <>
      <Portal>
        <Modal visible={shouldShowBrowser} onDismiss={() => { setShouldShowBrowser(false) }} contentContainerStyle={{ flex: 1, backgroundColor: "#fff" }}>
          <Browser key="lesson.material.url" initialUrl={lesson.material.url} onClose={() => setShouldShowBrowser(false)} />
        </Modal>
      </Portal>
      {lesson.material.type === "video" ?
        <View style={{ flexGrow: 1 }}>
          <WebView
            originWhitelist={['*']}
            source={{ uri: lesson.material.url }}
            style={styles.youtubeWebview}
            allowsFullscreenVideo={false}
            allowFullScreen={false}
            allowsInlineMediaPlayback
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
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  width: "100%",
                }}>
                  {utc(caption.offset).format('HH:mm:ss')}: {caption.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View> :
        <View style={{ height: "100%", width: "100%", alignContent: "center", justifyContent: "center" }}>
          <View style={{ padding: 24 }}>
            <Button mode="contained" onPress={() => { setShouldShowBrowser(true) }}>Go to the article page</Button>
          </View>
          {/* {shouldEmbed && <WebView
            startInLoadingState
            mediaPlaybackRequiresUserAction
            originWhitelist={['*']}
            source={{ uri: lesson.material.url }}
            style={styles.webview}
          menuItems={[{ label: 'Tweet', key: 'tweet' }, { label: 'Save for later', key: 'saveForLater' }]}
          />} */}
          {/* {!shouldEmbed && <View style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Button>Go to the website</Button>
          </View>} */}
        </View>
      }
    </>
  )
}

function LearningMode({ onPressToggle, lesson }: { onPressToggle: () => void, lesson: {} }) {
  const [tab, setTab] = useState(LearningModeTab.Article)
  const [openArticle, setOpenArticle] = useState(true)

  const dispatch = useAppDispatch()
  const captions = useAppSelector(state => {
    if (!lesson.material) return []
    const materialId = lesson.material.id
    if (!state.videoInfo.captions[materialId]) return []
    return state.videoInfo.captions[materialId]
  })

  useEffect(() => {
    dispatch(fetchSavedVocab())
    dispatch(fetchVocabs({ materialId: lesson.material.id }))
  }, [])


  return (
    <View style={{ width: "100%", height: "100%" }}>
      <View style={styles.menu}>
        <View style={[styles.tabWrapper]}>
          <TouchableOpacity onPress={() => setTab(LearningModeTab.Article)}>
            <View style={tab === LearningModeTab.Article ? styles.buttonActive : null}>
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

      {
        tab === LearningModeTab.Article &&
        <ArticleTab lesson={lesson} captions={captions} />
      }
      {
        tab === LearningModeTab.Summary && (
          <SummaryTab materialId={lesson.material.id} />
        )
      }
      {
        tab === LearningModeTab.Vocabulary && (
          <VocabularyTab materialId={lesson.material.id} />
        )
      }
      <TouchableOpacity onPress={onPressToggle} style={styles.switch}>
        <View style={{ flexDirection: "row", justifyContent: 'center', alignContent: "center" }}>
          <View style={{ marginRight: 4 }}>
            <Ionicons name="chatbubble-ellipses" size={18} color="white" />
          </View>
          <Text style={styles.buttonTalkMode}>Go to {Mode.Talk} Mode</Text>
        </View>
      </TouchableOpacity >
    </View >
  )
}

enum Mode {
  Learning = 'Learning',
  Talk = 'Talk',
}

export function LessonScreen({ route, navigation }) {
  const dispatch = useAppDispatch()
  const lessonId = route.params.lessonId
  const lesson = useAppSelector(state => { return state.lesson.lessons.find((lesson) => lesson.id === lessonId) })

  const onPressToggle = () => navigation.navigate('Talk', { lessonId })

  useEffect(() => {
    dispatch(fetchLesson(lessonId))
    dispatch(fetchMessages(lessonId))
  }, [])


  if (!lesson || !lesson.material) {
    return null
  }

  return (
    <View style={styles.container}>
      <LearningMode onPressToggle={onPressToggle} lesson={lesson} />
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    padding: 4,
    height: 48,
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
    alignItems: 'center',
  },
  vocabularyView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 24,
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
