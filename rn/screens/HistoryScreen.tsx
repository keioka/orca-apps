import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { CardArticle } from '../components/CardArticle';
import { UserStats } from '../components/UserStats';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useEffect } from 'react';
import { fetchLessons, createLesson } from '../redux/features/lessons';
import { fetchCurrentUserStats } from '../redux/features/auth';
import { i18n } from '../locales';
import { Text } from '../components/Text';
import LottieView from 'lottie-react-native';

export function HistoryScreen({ navigation }) {
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


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchLessons())
    dispatch(fetchCurrentUserStats())
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
              height: 200,
            }}
          />
          <Text>{i18n.t("loading")}</Text>
        </View>}
        {!fetchingCurrentUserStats && stats && <View style={{ width: "100%" }}>
          <UserStats stats={stats} />
        </View>}
        <View style={styles.sectionSubtitle}>
          <Text style={styles.subtitle} weight='Bold'>{i18n.t("pastLesson")}</Text>
        </View>
        {/* {feed.map((item, index) => (
          <CardArticle
            item={item}
            onPressStart={() => onPressStart({ url: item.url, materialId: item.id })}
          />
        ))} */}
        {lessons && lessons.map((item, index) => (
          <CardArticle
            key={`lesson_${item.id}`}
            item={item.material}
            onPressStart={() => onPressStart({ url: item.material.url, lessonId: item.id })}
            lessonId={item.id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 12,
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  sectionSubtitle: {
    paddingTop: 0,
    paddingBottom: 0,
    width: '90%',
    justifyContent: 'flex-start',
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 18,
  }
});
