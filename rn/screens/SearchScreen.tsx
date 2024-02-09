import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { CardArticle } from '@/components/CardArticle';
import { UserStats } from '@/components/UserStats';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useEffect } from 'react';
import { fetchLessons, createLesson } from '../redux/features/lessons';
import { fetchCurrentUserStats } from '../redux/features/auth';
import { i18n } from '../locales';
import { Text } from '@/components/Text';
import LottieView from 'lottie-react-native';

export function SearchScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { lessons } = useAppSelector((state) => state.lesson);
  const stats = useAppSelector((state) => state.auth.stats);
  const fetchingCurrentUserStats = useAppSelector((state) => state.auth.fetchingCurrentUserStats);

  useEffect(() => {
    dispatch(fetchLessons())
    dispatch(fetchCurrentUserStats())
  }, []);

  const onPressStart = ({ url, lessonId }: { url: string, lessonId: string }) => {
    if (!lessonId) {
      console.error("Lesson ID is required")
      throw new Error("Lesson ID is required")
    }
    navigation.navigate('Lesson', { url, lessonId })
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContainer} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {/* <View style={styles.sectionSubtitle}>
          <Text style={styles.subtitle}>Progress this week</Text>
        </View> */}
        <View style={styles.sectionSubtitle}>
          <Text style={styles.subtitle} weight='Bold'>{i18n.t("progress")}</Text>
        </View>
        {fetchingCurrentUserStats && <View style={{ alignItems: "center" }}>
          <LottieView
            source={{ uri: "https://lottie.host/3bdc5a86-4c2b-404b-bf95-8f633427dbff/hvfRexUsjO.json" }}
            autoPlay
            loop
            style={{
              width: 400,
              height: 400,
            }}
          />
        </View>}
        {!fetchingCurrentUserStats && <UserStats stats={stats} />}
        <View style={styles.sectionSubtitle}>
          <Text style={styles.subtitle} weight='Bold'>{i18n.t("recently")}</Text>
        </View>
        {lessons.map((lesson) => (
          <CardArticle
            key={lesson.id}
            article={lesson}
            onPressStart={() => onPressStart({ url: lesson.url, lessonId: lesson.id })}
          />
        ))}
      </ScrollView>
    </View>
  )
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
