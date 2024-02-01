import { useState, useCallback, useEffect, useMemo } from 'react';
// import { CardArticle } from '../components/CardArticle';
// import { UserStats } from '../components/UserStats';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLessons } from '@/redux/features/lessons';
import { fetchCurrentUserStats } from '@/redux/features/auth';
import { Header } from '@/components/Header';
import { Material } from '@/components/Material';
import { saveVocab, fetchSavedVocab, fetchSavedParaphrases } from '@/redux/features/note';
import { CardVocab } from '@/components/CardVocab';
import { CardVocabSM } from '@/components/CardVocabSM';
import { Box } from '@mui/material'
import { Chip } from '@/components/Chip'
import { ListChip } from '@/components/ListChip';
import { CardParaphrase } from '@/components/CardParaphrase';

enum Tab {
  Vocab = 0,
  Paraphrase = 1
}

export default function Note() {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { lessons } = useAppSelector((state) => state.lesson);
  const stats = useAppSelector((state) => state.auth.stats);
  const [tab, setTab] = useState(Tab.Vocab);

  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const savedVocabs = useAppSelector((state) => state.note.vocabularies)
  const savedParaphrases = useAppSelector((state) => state.note.paraphrases)

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchSavedVocab())
      dispatch(fetchSavedParaphrases({}))
    }
  }, [currentUser])

  const vocabMapped = useMemo(() => {
    return savedVocabs.map((item, index) => {
      return {
        ...item.vocabulary,
        meaningInJapanese: item.vocabulary.translation.find((item) => item.language.code === "ja")?.content,
      }
    })
  }, [savedVocabs])

  return (
    <Box>
      <Header />
      <Box px={2}>
        <ListChip
          items={[
            { label: "単語帳", onClick: () => setTab(Tab.Vocab), isActive: tab === Tab.Vocab },
            { label: "言い換え表現", onClick: () => setTab(Tab.Paraphrase), isActive: tab === Tab.Paraphrase }
          ]}
        />
      </Box>
      <Box p={2}>
        {
          tab === Tab.Vocab && vocabMapped && vocabMapped.map((vocab, index) => (
            <Box my={1}>
              <CardVocabSM
                key={`lesson_${vocab.id}`}
                vocab={vocab}
              />
            </Box>
          ))
        }
        {
          tab === Tab.Paraphrase && savedParaphrases && savedParaphrases.map((paraphrase, index) => (
            <Box my={1}>
              <CardParaphrase
                paraphrase={paraphrase}
              />
            </Box>
          ))
        }
      </Box>
    </Box>
  );
}