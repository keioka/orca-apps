import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Modal, Portal, Text, Snackbar } from 'react-native-paper';
import { CardArticle } from '../components/CardArticle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMaterials, clearError } from '../redux/features/materials';
import { createLesson, clearCreatedLessonId, clearError as clearErrorLesson } from '../redux/features/lessons';
import { signOut } from '../redux/features/auth';

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
  const { creating, createdLessonId, error: errorLesson } = useAppSelector((state) => state.lessons);

  const { items, } = useAppSelector((state) => state.materials);
  const session = useAppSelector((state) => state.auth.session)
  const [selectedCategory, setActiveCategory] = useState(categories[0].id)

  useEffect(() => {
    dispatch(fetchMaterials())
  }, [])

  useEffect(() => {
    if (createdLessonId) {
      navigation.navigate('Lesson', { lessonId: createdLessonId })
      dispatch(clearCreatedLessonId())
    }
  }, [creating, createdLessonId])

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

  return (
    <View style={styles.container}>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerDateText}>July 19</Text>
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
              <TouchableOpacity onPress={() => setActiveCategory(category.id)}>
                <View style={[{ justifyContent: "center", alignItems: "center", width: 96, height: 80, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === category.id && { borderBottomColor: "#4CB8C4" }]}>
                  <Ionicons name={category.icon} size={24} color={selectedCategory === category.id ? "#4CB8C4" : "#242424"} />
                  <Text style={{ marginTop: 8, }}>{category.title}</Text>
                </View>
              </TouchableOpacity>
            )
          })}

        </ScrollView>
        {
          feed.map((item, index) => (
            <CardArticle
              type={item.type}
              title={item.title}
              imageSource={{ uri: item.imageUrl }}
              onPressStart={() => onPressStart({ url: item.url, materialId: item.id })}
            />
          ))
        }
        {
          items.map((item, index) => (
            <CardArticle
              type={item.type}
              title={item.name}
              imageSource={{ uri: item.url }}
              onPressStart={() => onPressStart({ url: item.url, lessonId: item.lessonId, materialId: item.id })}
              lessonId={item.lessonId}
            />
          ))
        }
      </ScrollView>
      <Snackbar
        visible={!!error || !!errorLesson}
        onDismiss={handleClearAllErrors}
      >
        {error || errorLesson}
      </Snackbar>
    </View >
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
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingTop: 80,
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
