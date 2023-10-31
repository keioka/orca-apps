import { useState, useEffect, useMemo, useCallback, } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Modal, Portal, Text, Snackbar } from 'react-native-paper';
import { CardArticle } from '../components/CardArticle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMaterials, clearError } from '../redux/features/materials';
import { createLesson, clearCreatedLessonId, clearError as clearErrorLesson } from '../redux/features/lessons';
import { signOut } from '../redux/features/auth';
import { clearHasSuccessCreateFollow } from '../redux/features/publishers';

const categories = [
  {
    id: 0,
    title: 'For you',
    icon: 'star-outline',
  },
  {
    id: 1,
    title: 'US News',
    icon: 'book-outline',
  },
  {
    id: 2,
    title: 'World News',
    icon: 'globe-outline',
  },
  {
    id: 3,
    title: 'Business',
    icon: 'briefcase-outline',
  },
  {
    id: 4,
    title: 'Technology',
    icon: 'hardware-chip-outline',
  },
  {
    id: 5,
    title: 'Entertainment',
    icon: 'film-outline',
  },
  {
    id: 6,
    title: 'Sports',
    icon: 'football-outline',
  },
  {
    id: 7,
    title: 'Science',
    icon: 'flask-outline',
  },
  {
    id: 8,
    title: 'Health',
    icon: 'heart-outline',
  },
]

export function FeedScreen({ navigation }) {
  const dispatch = useAppDispatch()
  const { feed, status, error } = useAppSelector((state) => state.feed);
  const { lessons, creating, createdLessonId, error: errorLesson } = useAppSelector((state) => state.lesson);
  const { items } = useAppSelector((state) => state.material);
  const session = useAppSelector((state) => state.auth.session)
  const [selectedCategory, setActiveCategory] = useState(categories[0].id)
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchMaterials({
      category: selectedCategory === 0 ? null : categories[selectedCategory].title,
      offset,
      limit: 50
    }))
    setOffset(offset + 50)
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    dispatch(fetchMaterials({
      category: selectedCategory === 0 ? null : categories[selectedCategory].title,
      offset,
      limit: 50
    }))
    setOffset(offset + 50)
  }, [])

  useEffect(() => {
    if (createdLessonId) {
      navigation.navigate('Lesson', { lessonId: createdLessonId })
      dispatch(clearCreatedLessonId())
    }
  }, [creating, createdLessonId])

  const materials = useMemo(() => {
    return items.map((item) => {
      const lesson = lessons.find((lesson) => lesson.materialId === item.id)
      return {
        ...item,
        lessonId: lesson?.id
      }
    })
  }, [items, lessons])

  console.log({ materials })
  const handleSignOut = async () => {
    dispatch(signOut())
    navigation.navigate('Auth')
  }

  const handlePress = () => {
    session ? handleSignOut() : navigation.navigate('Auth')
  }

  const onPressStart = ({ materialId, url, lessonId }: { materialId: string, url: string, lessonId: string }) => {
    if (!lessonId) {
      dispatch(createLesson({ materialId }))
    } else {
      navigation.navigate('Lesson', { url, lessonId })
    }
  }

  const handleClearAllErrors = () => {
    clearErrorLesson()
    clearError()
  }

  const handleNavigateToCategory = () => {
    dispatch(clearHasSuccessCreateFollow())
    navigation.navigate('Category')
  }

  return (
    <SafeAreaView style={styles.container}>
      <Portal>
        <Modal visible={creating} dismissable={false}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff" }}>Creating...</Text>
          </View>
        </Modal>
      </Portal>
      <View
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerDateText}>{getToday()}</Text>
          <TouchableOpacity onPress={handlePress}>
            {session ? <View>
              {/* <Text style={styles.headerDateText}>s</Text> */}
              {/* login */}
              <Ionicons name="person-circle-outline" size={32} color="#4CB8C4" />
            </View> : <View>
              {/* <Text style={styles.headerDateText}>s</Text> */}
              {/* login */}
              <Ionicons name="person-circle-outline" size={32} color="#242424" />
            </View>}
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.categoryMenu}
          contentContainerStyle={styles.categoryMenuScrollViewContainer}
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          {categories.map((category) => {
            return (
              <TouchableOpacity key={category.id} onPress={() => setActiveCategory(category.id)}>
                <View style={[{ justifyContent: "center", alignItems: "center", width: 96, height: 80, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === category.id && { borderBottomColor: "#4CB8C4" }]}>
                  <Ionicons name={category.icon} size={24} color={selectedCategory === category.id ? "#4CB8C4" : "#242424"} />
                  <Text style={{ marginTop: 8, }}>{category.title}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity key="category_add" onPress={handleNavigateToCategory}>
            <View style={[{ justifyContent: "center", alignItems: "center", width: 96, height: 80, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }]}>
              <Ionicons name="add-circle-outline" size={24} color="#242424" />
              <Text style={{ marginTop: 8, }}>Add</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {
            feed.map((item, index) => (
              <View key={index} style={{ marginVertical: 2, width: "95%" }}>
                <CardArticle
                  item={item}
                  onPressStart={() => onPressStart({ url: item.url, materialId: item.id })}
                />
              </View>
            ))
          }
          {
            materials.map((item, index) => (
              <View key={item.id} style={{ marginVertical: 2, width: "95%" }}>
                <CardArticle
                  item={item}
                  onPressStart={() => onPressStart({ url: item.url, lessonId: item.lessonId, materialId: item.id, lessonId: item.lessonId })}
                  lessonId={item.lessonId}
                />
              </View>
            ))
          }
        </ScrollView>
      </View>
      <Snackbar
        visible={!!error || !!errorLesson}
        onDismiss={handleClearAllErrors}
      >
        {error || errorLesson}
      </Snackbar>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingTop: 30,
    // paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerDateText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  categoryMenu: {
    // paddingTop: 96,
  },
  categoryMenuActive: {
    // paddingTop: 96,
  },
  categoryMenuScrollViewContainer: {
    // paddingTop: 96,
  },
});

function getDayWithSuffix(day: number) {
  if (day >= 11 && day <= 13) {
    return day + "th";
  } else {
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1:
        return day + "st";
      case 2:
        return day + "nd";
      case 3:
        return day + "rd";
      default:
        return day + "th";
    }
  }
}

function getToday() {
  // Create a new Date object
  const currentDate = new Date();

  // Define an array of month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get the month and day from the current date
  const month = monthNames[currentDate.getMonth()];
  const day = currentDate.getDate();

  // Get the day with the appropriate suffix
  const formattedDay = getDayWithSuffix(day);

  // Create the desired format
  const formattedDate = `${month} ${formattedDay}`;

  return formattedDate;
}