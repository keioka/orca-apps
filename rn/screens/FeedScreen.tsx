import { useState, useEffect, useMemo, useCallback, } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Modal, Portal, Text, Snackbar, Button } from 'react-native-paper';
import { CardArticle } from '../components/CardArticle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMaterials, clearError } from '../redux/features/materials';
import { createLesson, clearCreatedLessonId, clearError as clearErrorLesson } from '../redux/features/lessons';
import { signOut } from '../redux/features/auth';
import { clearHasSuccessCreateFollow, fetchFollowPublishers } from '../redux/features/publishers';
import { categories } from '../helpers/categories';

export function FeedScreen({ navigation }) {
  const dispatch = useAppDispatch()
  const { feed, status, error } = useAppSelector((state) => state.feed);
  const { lessons, creating, createdLessonId, error: errorLesson } = useAppSelector((state) => state.lesson);
  const { items } = useAppSelector((state) => state.material);
  const session = useAppSelector((state) => state.auth.session)
  const [selectedCategory, setActiveCategory] = useState("all")
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const followPublisherIds = useAppSelector((state) => state.publisher.followIds)
  const followCategories = useAppSelector((state) => state.publisher.followCategories)

  useEffect(() => {
    dispatch(fetchFollowPublishers())
  }, [])

  useEffect(() => {
    dispatch(fetchMaterials({
      offset,
      limit: 50,
      followPublisherIds
    }))
    setOffset(offset + 50)

  }, [followPublisherIds])

  useEffect(() => {
    if (createdLessonId) {
      navigation.navigate('Lesson', { lessonId: createdLessonId })
      dispatch(clearCreatedLessonId())
    }
  }, [creating, createdLessonId])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchMaterials({
      // category: selectedCategory === "all" ? null : categories[selectedCategory].slug,
      offset,
      limit: 50
    }))
    setOffset(offset + 50)
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);


  const materials = useMemo(() => {
    if (!items) return []
    return items.map((item) => {
      const lesson = lessons.find((lesson) => lesson.materialId === item.id)
      return {
        ...item,
        lessonId: lesson?.id
      }
    })
  }, [items, lessons])

  const selectedMaterials = useMemo(() => {
    if (!materials) return []
    if (selectedCategory === "all") {
      return materials
    }
    return materials.filter((material) => material.publisher.category === selectedCategory)
  }, [materials, selectedCategory])

  const followCategoryItems = useMemo(() => {
    if (!followCategories) return []
    return categories.filter((category) => followCategories.includes(category.slug))
  }, [followCategories])

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
          <TouchableOpacity key="all" onPress={() => setActiveCategory("all")}>
            <View style={[{ justifyContent: "center", alignItems: "center", width: 96, height: 80, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === "all" && { borderBottomColor: "#4CB8C4" }]}>
              <Ionicons name="star" size={24} color={selectedCategory === "all" ? "#4CB8C4" : "#242424"} />
              <Text style={{ marginTop: 8, }}>All</Text>
            </View>
          </TouchableOpacity>

          {followCategoryItems.map((category) => {
            return (
              <TouchableOpacity key={category.slug} onPress={() => setActiveCategory(category.slug)}>
                <View style={[{ justifyContent: "center", alignItems: "center", width: 96, height: 80, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === category.slug && { borderBottomColor: "#4CB8C4" }]}>
                  <Ionicons name={category.icon} size={24} color={selectedCategory === category.slug ? "#4CB8C4" : "#242424"} />
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
          {/* {
            feed.map((item, index) => (
              <View key={index} style={{ marginVertical: 2, width: "95%" }}>
                <CardArticle
                  item={item}
                  onPressStart={() => onPressStart({ url: item.url, materialId: item.id })}
                />
              </View>
            ))
          } */}
          {
            materials.length === 0 && (
              <View style={{ width: "100%", height: 200, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#242424" }}>No materials</Text>
                <Button onPress={handleNavigateToCategory} mode="contained">Add News Feeds</Button>
              </View>
            )
          }
          {
            selectedMaterials.map((item, index) => (
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