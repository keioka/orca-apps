import { useState, useEffect, useMemo, useCallback, } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Modal, Portal, Snackbar, Button, Menu } from 'react-native-paper';
import { CardArticle } from '../components/CardArticle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMaterials, clearError } from '../redux/features/materials';
import { createLesson, clearCreatedLessonId, clearError as clearErrorLesson } from '../redux/features/lessons';
import { signOut } from '../redux/features/auth';
import { clearHasSuccessCreateFollow, fetchFollowPublishers } from '../redux/features/publishers';
import { categories } from '../helpers/categories';
import { Text } from '../components/Text';
import { fetchLessons } from '../redux/features/lessons';
import * as Updates from 'expo-updates';

export function FeedScreen({ navigation }) {
  const dispatch = useAppDispatch()
  const creating = useAppSelector((state) => state.lesson.creating);
  const createdLessonId = useAppSelector((state) => state.lesson.createdLessonId);
  const errorLesson = useAppSelector((state) => state.lesson.error);
  const lessons = useAppSelector((state) => state.lesson.lessons);

  const items = useAppSelector((state) => state.material.items);
  const [selectedCategory, setActiveCategory] = useState("all")
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingEnd, setRefreshingEnd] = useState(false);
  const [shouldShowMenu, setShouldShowMenu] = useState(false);
  const [offset, setOffset] = useState(0);
  const isInitMaterials = useAppSelector((state) => state.material.isInitMaterials)
  const followPublishers = useAppSelector((state) => state.publisher.followPublishers)
  const followCategories = useAppSelector((state) => state.publisher.followCategories)

  useEffect(() => {
    dispatch(fetchLessons())
    dispatch(fetchFollowPublishers())
  }, [])

  const selectedFollowPublisherIds = useMemo(() => {
    if (!followPublishers) return []
    return followPublishers.filter((publisher) => {
      if (selectedCategory === "all") return true
      return publisher.category === selectedCategory
    }).map((publisher) => publisher.publisherId)
  }, [followPublishers, selectedCategory])

  useEffect(() => {
    if (selectedFollowPublisherIds.length === 0) return
    dispatch(fetchMaterials({
      offset,
      limit: 50,
      publisherIds: selectedFollowPublisherIds,
    }))
    setOffset(offset + 50)

  }, [selectedFollowPublisherIds])

  useEffect(() => {
    if (createdLessonId) {
      navigation.navigate('Lesson', { lessonId: createdLessonId })
      dispatch(clearCreatedLessonId())
    }
  }, [creating, createdLessonId])


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchMaterials({
      offset: 0,
      limit: 50,
      publisherIds: selectedFollowPublisherIds
    }))
    // setOffset(offset + 50)
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [selectedFollowPublisherIds]);


  const handleEndRefresh = useCallback(() => {
    setRefreshingEnd(true);
    dispatch(fetchMaterials({
      offset,
      limit: 50,
      publisherIds: selectedFollowPublisherIds
    }))
    setOffset(offset + 50)
    setTimeout(() => {
      setRefreshingEnd(false);
    }, 2000);
  }, [selectedFollowPublisherIds]);

  const materials = useMemo(() => {
    if (!items) return []
    return items
      .map((item) => {
        const lesson = lessons.find((lesson) => lesson.materialId === item.id)
        return {
          ...item,
          lessonId: lesson?.id
        }
      }).sort((a, b) => {

        return new Date(b.publishedAt) - new Date(a.publishedAt);
      })
  }, [items, lessons])

  const selectedMaterials = useMemo(() => {
    if (!materials) return []
    if (selectedCategory === "all") {
      return materials
    }
    return materials.filter((material) => material.publisher.category === selectedCategory).filter((material) => !!material)
  }, [materials, selectedCategory])

  const followCategoryItems = useMemo(() => {
    if (!followCategories) return []
    return categories.filter((category) => followCategories.includes(category.slug))
  }, [followCategories])

  const handleSignOut = async () => {
    dispatch(signOut())
    navigation.navigate('Auth')
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

  const handleSelectTab = useCallback((slug: string) => {
    setActiveCategory(slug)
    const newSelectedFollowPublisherIds = followPublishers
      .filter((publisher) => {
        if (slug === "all") return true
        return publisher.category === slug
      })
      .map((publisher) => publisher.publisherId)

    dispatch(fetchMaterials({
      offset: 0,
      limit: 50,
      publisherIds: newSelectedFollowPublisherIds
    }))
    setOffset(50)
  }, [])

  const handleForceUpdate = () => {
    Updates.reloadAsync()
  }

  return (
    <SafeAreaView style={styles.container}>
      <Portal>
        <Modal
          visible={creating}
          dismissable={false}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            height: "100%",
            width: "100%",
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: "100%",
              width: "100%",
            }}
          >
            <View style={{ height: "100%", width: "100%" }}>
            </View>
            <View>
              <ActivityIndicator size="large" color="#fff" />
              <View style={{ height: "100%", width: "100%", marginTop: 16 }}>
                <Text style={{ color: "#fff", fontSize: 24, textAlign: "center" }}>Creating New Lesson</Text>
                <View style={{ marginTop: 16, backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
                  <Text style={{ fontSize: 22 }}>Once it is created...</Text>

                  <Text style={{ fontSize: 18 }}>1. Read the new article</Text>
                  <Text style={{ fontSize: 18 }}>2. Check the summary and vocabulary</Text>
                  <Text style={{ fontSize: 18 }}>3. Chat with AI</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
      <View
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerDateText} weight='Bold'>{getToday()}</Text>
          <Menu
            visible={shouldShowMenu}
            onDismiss={() => { setShouldShowMenu(false) }}
            contentStyle={{
              backgroundColor: '#fff',
              padding: 0,
              margin: 0,
              borderRadius: 8,
              width: "100%",
            }}
            style={{
              left: 0,
              top: 120,
              width: "100%",
              paddingHorizontal: 24,
            }}
            anchor={
              <TouchableOpacity onPress={() => { setShouldShowMenu(!shouldShowMenu) }}>
                <View>
                  <Ionicons name="person-circle-outline" size={32} color="#2FABE8" />
                </View>
              </TouchableOpacity>
            }>
            <Menu.Item onPress={handleSignOut} title="Signout" style={{ borderBottomWidth: 1, width: "100%", paddingRight: 0, borderBottomColor: "#e4e4e4" }} />
            <Menu.Item onPress={() => setShouldShowMenu(false)} title="Close" style={{ borderBottomWidth: 1, width: "100%", paddingRight: 0, borderBottomColor: "#e4e4e4" }} />
            <Menu.Item onPress={handleForceUpdate} title="Force update" />
            <View style={{ backgroundColor: "#e4e4e4", width: "100%", padding: 18 }}>
              <Text>Last updated at: {Updates.createdAt ? Updates.createdAt.toString() : "No updates"}</Text>
            </View>
          </Menu>
        </View>
        <ScrollView
          style={styles.categoryMenu}
          contentContainerStyle={styles.categoryMenuScrollViewContainer}
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          <TouchableOpacity key="all" onPress={() => setActiveCategory("all")}>
            <View style={[{ justifyContent: "center", alignItems: "center", width: 108, height: 64, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === "all" && { borderBottomColor: "#2FABE8" }]}>
              <View style={{ height: 24 }}>
                <Ionicons name="star" size={24} color={selectedCategory === "all" ? "#2FABE8" : "#242424"} />
              </View>
              <Text style={{ marginTop: 8, }}>All</Text>
            </View>
          </TouchableOpacity>

          {followCategoryItems && followCategoryItems.map((category) => {
            return (
              <TouchableOpacity key={category.slug} onPress={() => handleSelectTab(category.slug)}>
                <View style={[{ justifyContent: "center", alignItems: "center", width: 108, height: 64, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === category.slug && { borderBottomColor: "#2FABE8" }]}>
                  <View style={{ height: 24 }}>
                    <Ionicons name={category.icon} size={24} color={selectedCategory === category.slug ? "#2FABE8" : "#242424"} />
                  </View>
                  <Text style={{ marginTop: 8, }}>{category.title}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity key="category_add" onPress={handleNavigateToCategory}>
            <View style={[{ justifyContent: "center", alignItems: "center", width: 108, height: 64, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }]}>
              <View style={{ height: 24 }}>
                <Ionicons name="add-circle-outline" size={24} color="#242424" />
              </View>
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
          onMomentumScrollEnd={handleEndRefresh}
        >
          {!isInitMaterials && (
            <View style={{ width: "100%", height: 200, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#242424" />
            </View>
          )}
          {
            isInitMaterials && materials.length === 0 && (
              <View style={{ width: "100%", height: 200, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#242424" }}>No materials</Text>
                <Button onPress={handleNavigateToCategory} mode="contained">Add News Feeds</Button>
              </View>
            )
          }
          {
            selectedMaterials && selectedMaterials.map((item) => (
              <View key={item.id} style={{ marginVertical: 2, width: "100%" }}>
                <CardArticle
                  item={item}
                  onPressStart={() => onPressStart({ url: item.url, lessonId: item.lessonId, materialId: item.id, lessonId: item.lessonId })}
                  lessonId={item.lessonId}
                />
              </View>
            ))
          }
          {
            refreshingEnd && (
              <View style={{ width: "100%", height: 200, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#242424" />
              </View>
            )
          }
        </ScrollView>
      </View >
      <Snackbar
        visible={!!errorLesson}
        onDismiss={handleClearAllErrors}
      >
        {errorLesson}
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
    // alignItems: 'center',
    alignItems: 'flex-start',
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
    // paddingTop: 0,
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