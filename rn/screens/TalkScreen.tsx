import { useState, useEffect, useMemo, useRef } from 'react';
import { TalkMode } from '@/components/TalkMode';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchLesson } from '../redux/features/lessons';
import { fetchMessages, createMessage, addMessage } from '../redux/features/messages';
import { StyleSheet, ScrollView, Text, View } from 'react-native';

export function TalkScreen({ route, navigation }) {
  const dispatch = useAppDispatch()
  const lessonId = route.params.lessonId
  const lesson = useAppSelector(state => { return state.lesson.lessons.find((lesson) => lesson.id === lessonId) })

  const onPressToggle = () => navigation.navigate('Lesson', { lessonId })

  useEffect(() => {
    if (!lesson) {
      dispatch(fetchLesson(lessonId))
    }
    dispatch(fetchMessages(lessonId))
  }, [lessonId])


  if (!lesson || !lesson.material) {
    return null
  }

  return (
    <View style={styles.container}>
      <TalkMode onPressToggle={onPressToggle} lesson={lesson} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    height: "100%",
  },
});
