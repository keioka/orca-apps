import { useRef, useState, useEffect, useMemo, useCallback, } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Modal, Portal, Snackbar, Button, Menu } from 'react-native-paper';
import { CardArticle } from '@/components/CardArticle';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMaterials, fetchOriginalMaterials, clearError } from '../redux/features/materials';
import { createLesson, clearCreatedLessonId, clearError as clearErrorLesson } from '../redux/features/lessons';
import { signOut, toggleFeatureFlag } from '../redux/features/auth';
import { clearHasSuccessCreateFollow, fetchFollowPublishers } from '../redux/features/publishers';
import { categories } from '../helpers/categories';
import { Text } from '@/components/Text';
import { fetchLessons } from '../redux/features/lessons';
import * as Updates from 'expo-updates';
import { Feather } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { analytics, ACTION } from '../helpers/mixpanel';
import { Linking } from "react-native";
import { i18n } from '../locales';
import { NewsCarousel } from '@/components/NewsCarousel';
import { SearchMaterials } from '@/components/SearchMaterials';
import { FontAwesome5 } from '@expo/vector-icons';

interface OffsetByCategory {
  [key: string]: number
}

interface LoadingByCategory {
  [key: string]: boolean
}

export function OriginalFeedScreen({ navigation }) {
  const dispatch = useAppDispatch()
  const creating = useAppSelector((state) => state.lesson.creating);
  const createdLessonId = useAppSelector((state) => state.lesson.createdLessonId);
  const errorLesson = useAppSelector((state) => state.lesson.error);
  const lessons = useAppSelector((state) => state.lesson.lessons);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isOnFeatureFlag = useAppSelector((state) => state.auth.isOnFeatureFlag);
  const items = useAppSelector((state) => state.material.items);
  const originalItems = useAppSelector((state) => state.material.originalItems);
  const featureFlags = useAppSelector((state) => state.featureFlag.featureFlags)

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingEnd, setRefreshingEnd] = useState(false);
  const [shouldShowMenu, setShouldShowMenu] = useState(false);
  const [offsetByCategory, setOffsetByCategory] = useState<OffsetByCategory>({});
  const isInitMaterials = useAppSelector((state) => state.material.isInitMaterials)
  const followPublishers = useAppSelector((state) => state.publisher.followPublishers)
  const followCategories = useAppSelector((state) => state.publisher.followCategories)

  useEffect(() => {
    dispatch(fetchLessons())
    dispatch(fetchFollowPublishers())
    dispatch(fetchOriginalMaterials())
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

    const offset = offsetByCategory[selectedCategory] || 0
    dispatch(fetchMaterials({
      offset: offset,
      limit: 50,
      publisherIds: selectedFollowPublisherIds,
    }))

  }, [selectedFollowPublisherIds, selectedFollowPublisherIds.length])

  useEffect(() => {
    if (createdLessonId) {
      navigation.navigate('LessonOriginal', { lessonId: createdLessonId })
      dispatch(clearCreatedLessonId())
    }
  }, [creating, createdLessonId])

  const onScrollFeed = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    if (isCloseToBottom) {
      // You've reached the end
      console.log('Reached the end of the content!');
      handleEndRefresh()
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchOriginalMaterials())
    dispatch(fetchMaterials({
      offset: 0,
      limit: 50,
      publisherIds: selectedFollowPublisherIds
    }))

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [selectedFollowPublisherIds, selectedFollowPublisherIds.length]);

  const handleEndRefresh = useCallback(() => {
    if (selectedFollowPublisherIds.length === 0) return
    if (refreshingEnd) return
    setRefreshingEnd(true);
    const offset = offsetByCategory[selectedCategory] === undefined ? 0 : offsetByCategory[selectedCategory]
    const nextOffset = offset + 50
    dispatch(fetchMaterials({
      offset: nextOffset,
      limit: 50,
      publisherIds: selectedFollowPublisherIds
    }))

    setOffsetByCategory({
      ...offsetByCategory,
      [selectedCategory]: nextOffset
    })

    setTimeout(() => {
      setRefreshingEnd(false);
    }, 2000);

  }, [refreshingEnd, selectedFollowPublisherIds, selectedCategory, offsetByCategory]);


  const handleSelectTab = useCallback((slug: string) => {
    setSelectedCategory(slug)

    const newSelectedFollowPublisherIds = followPublishers
      .filter((publisher) => {
        if (slug === "all") return true
        return publisher.category === slug
      })
      .map((publisher) => publisher.publisherId)

    if (newSelectedFollowPublisherIds.length === 0) return

    dispatch(fetchMaterials({
      offset: 0,
      limit: 50,
      publisherIds: newSelectedFollowPublisherIds
    }))

  }, [followPublishers])


  const originalMaterials = useMemo(() => {
    if (!originalItems) return []
    console.log({ originalItems })
    return originalItems
      .map((item) => {
        const lesson = lessons.find((lesson) => lesson.materialId === item.id)
        return {
          ...item,
          lessonId: lesson?.id
        }
      }).sort((a, b) => {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      })
  }, [originalItems, lessons])


  const handleSignOut = async () => {
    dispatch(signOut())
    navigation.navigate('Auth')
  }

  const onPressStart = ({ materialId, url, lessonId }: { materialId: string, url: string, lessonId: string }) => {
    if (!lessonId) {
      analytics.track(ACTION.startNewLesson, { materialId })
      dispatch(createLesson({ materialId }))
    } else {
      analytics.track(ACTION.reVisitLesson, { materialId, lessonId })
      navigation.navigate('LessonOriginal', { url, lessonId })
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
                <Text style={{ color: "#fff", fontSize: 24, textAlign: "center" }}>{i18n.t("navigatingToLesson")}</Text>
                <View style={{ marginTop: 16, backgroundColor: "#fff", padding: 16, borderRadius: 8 }}>
                  <Text style={{ fontSize: 22 }}>{i18n.t("instructionsLesson")}</Text>
                  <Text style={{ fontSize: 18 }}>1. {i18n.t("instructionOne")}</Text>
                  <Text style={{ fontSize: 18 }}>2. {i18n.t("instructionTwo")}</Text>
                  <Text style={{ fontSize: 18 }}>3. {i18n.t("instructionThree")}</Text>
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
            <Menu.Item
              onPress={handleSignOut}
              title={
                <View style={{ justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 8 }}>
                    <Feather name="log-out" size={24} color="black" />
                  </View>
                  <Text>{i18n.t("signout")}</Text>
                </View>
              }
              style={{ width: "100%", paddingRight: 0, borderBottomColor: "#e4e4e4" }}
            />
            <Menu.Item
              onPress={() => setShouldShowMenu(false)}
              title={
                <View style={{ justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 8 }}>
                    <Ionicons name="close" size={24} color="black" />
                  </View>
                  <Text>{i18n.t("close")}</Text>
                </View>
              }
              style={{ width: "100%", paddingRight: 0, borderBottomColor: "#e4e4e4" }}
            />
            <Menu.Item
              onPress={handleForceUpdate}
              title={
                <View style={{ justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 8 }}>
                    <MaterialIcons name="system-update" size={24} color="black" />
                  </View>
                  <Text>{i18n.t("forceUpdate")}</Text>
                </View>
              }
            />
            <Menu.Item
              onPress={() => Linking.openURL("https://forms.gle/QAGcTgNWnCsju5LY7")}
              title={
                <View style={{ justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 8 }}>
                    <MaterialIcons name="bug-report" size={24} color="black" />
                  </View>
                  <Text>{i18n.t("reportBug")}</Text>
                </View>
              }
            />
            {currentUser && currentUser.isAdmin && <Menu.Item
              onPress={() => {
                dispatch(toggleFeatureFlag())
              }}
              title={
                <View style={{ justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ marginRight: 8 }}>
                    <FontAwesome5 name="flag-checkered" size={18} color="black" />
                  </View>
                  <Text>Feature Flag</Text>
                </View>
              }
            />}
            <View style={{ backgroundColor: "#f2f2f2", width: "100%", padding: 18 }}>
              <Text>{i18n.t("lastUpdatedAt")}: {Updates.createdAt ? Updates.createdAt.toString() : "No updates"}</Text>
            </View>
            <View style={{ backgroundColor: "#f2f2f2", width: "100%", padding: 18 }}>
              <Text>{i18n.t("version")}: {Updates.updateId ? Updates.updateId + "-" + Updates.channel?.toLowerCase() : "N/A"}</Text>
            </View>
            <View style={{ backgroundColor: "#f2f2f2", width: "100%", padding: 18 }}>
              <Text>E:{process.env.EXPO_PUBLIC_APP_ENV}</Text>
            </View>
          </Menu>
        </View>
        {originalMaterials &&
          <>
            <View style={{ marginLeft: 18, marginTop: 36 }}>
              <Text weight='Bold' style={{ fontSize: 18 }}>{i18n.t("originalNewsTitle")}</Text>
            </View>
            <NewsCarousel news={originalMaterials} onPressStart={onPressStart} />
          </>
        }
      </View>

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
    alignItems: 'flex-start',
    // justifyContent: 'center',
    width: '100%'
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  scrollViewContainer: {
    width: '100%',
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