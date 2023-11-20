import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { CardVocab } from '../components/CardVocab';
import { vocab, phrases, grammar } from '../helpers/dummy';
import { CardPhrase } from '../components/CardPhrase';
import { CardGrammar } from '../components/CardGrammar';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSavedVocab, fetchSavedParaphrases } from '../redux/features/note';
import { Text } from '../components/Text';
import { i18n } from '../locales';

enum NoteTab {
  Vocabulary = 'vocabulary',
  Phrase = 'phrase',
  Grammar = 'grammar',
  FrequentlyUsed = 'frequentlyUsed',
}

export function NoteScreen() {
  const [tab, setTab] = useState(NoteTab.Vocabulary)
  const dispatch = useAppDispatch()
  const savedVocabularies = useAppSelector((state) => state.note.vocabularies)
  const savedParaphrases = useAppSelector((state) => state.note.paraphrases)

  useEffect(() => {
    dispatch(fetchSavedVocab())
    dispatch(fetchSavedParaphrases({}))
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setTab(NoteTab.Vocabulary)}>
            <View style={[styles.button, tab === NoteTab.Vocabulary ? styles.menuButtonActive : null]}>
              <Text style={[styles.textMenu, tab === NoteTab.Vocabulary ? styles.textMenuActive : null]} weight='SemiBold'>{i18n.t("vocabulary")}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab(NoteTab.Phrase)}>
            <View style={[styles.button, tab === NoteTab.Phrase ? styles.menuButtonActive : null]}>
              <Text style={[styles.textMenu, tab === NoteTab.Phrase ? styles.textMenuActive : null]} weight='SemiBold'>{i18n.t("paraphrase")}</Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={() => setTab(NoteTab.Grammar)}>
            <View style={[styles.button, tab === NoteTab.Grammar ? styles.menuButtonActive : null]}>
              <Text style={[styles.textMenu, tab === NoteTab.Grammar ? styles.textMenuActive : null]} weight='SemiBold'>Grammar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTab(NoteTab.FrequentlyUsed)}>
            <View style={[styles.button, tab === NoteTab.FrequentlyUsed ? styles.menuButtonActive : null]}>
              <Text style={[styles.textMenu, tab === NoteTab.FrequentlyUsed ? styles.textMenuActive : null]}>Frequently used</Text>
            </View>
          </TouchableOpacity> */}
        </ScrollView>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 24,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        {tab === NoteTab.Vocabulary && (
          <View style={{ width: "100%" }}>
            {savedVocabularies.map((item, index) => {
              const vocab = item.vocabulary
              return (
                <View key={`vocab_${vocab.id}`} style={styles.cardWrapper}>
                  <CardVocab
                    vocab={vocab}
                    hideSaveButton
                  />
                </View>
              )
            })}
          </View>
        )}

        {tab === NoteTab.Phrase && (
          <View style={{ width: "100%" }}>
            {savedParaphrases.map((item, index) => {
              return (
                <View key={`phrase_${item.id}`} style={styles.cardWrapper}>
                  <CardPhrase
                    data={item}
                  />
                </View>
              )
            })}
          </View>
        )}

        {tab === NoteTab.Grammar && (
          <View style={{ width: "100%" }}>
            {grammar.map((item, index) => (
              <View style={styles.cardWrapper}>
                <CardGrammar
                  data={item}
                />
              </View>
            ))}
          </View>
        )}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  cardWrapper: {
    marginBottom: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    width: '100%',
    paddingTop: 28,
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: "5%",
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
    overflow: 'scroll'
  },
  button: {
    minWidth: 110,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonActive: {
    backgroundColor: "#242424",
    borderRadius: 32,
    padding: 12,
  },
  textMenu: {
    textAlign: 'center',
  },
  textMenuActive: {
    color: "#fff"
  }
});
