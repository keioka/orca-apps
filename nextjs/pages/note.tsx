import { useState, useCallback, useEffect, useMemo } from 'react';
// import { CardArticle } from '../components/CardArticle';
// import { UserStats } from '../components/UserStats';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLessons } from '@/redux/features/lessons';
import { fetchCurrentUserStats } from '@/redux/features/auth';
import { Header } from '@/components/Header';
import { Material } from '@/components/Material';
import { saveVocab, fetchSavedVocab } from '@/redux/features/note';
import { CardVocab } from '@/components/CardVocab';
import { CardVocabSM } from '@/components/CardVocabSM';
import { Box } from '@mui/material'
import { Chip } from '@/components/Chip'
import { ListChip } from '@/components/ListChip';

export default function Note() {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { lessons } = useAppSelector((state) => state.lesson);
  const stats = useAppSelector((state) => state.auth.stats);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const savedVocabs = useAppSelector((state) => state.note.vocabularies)

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchSavedVocab())
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

  console.log({
    vocabMapped
  })
  return (
    <Box>
      <Header />
      <Box px={2}>
        <ListChip items={[{ label: "Vocab" }]} />
      </Box>
      <Box p={2}>
        {
          vocabMapped && vocabMapped.map((vocab, index) => (
            <Box my={1}>
              <CardVocabSM
                key={`lesson_${vocab.id}`}
                vocab={vocab}
              />
            </Box>
          ))
        }
      </Box>
    </Box>
  );
}