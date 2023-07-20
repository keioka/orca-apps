import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { CardArticle } from '../components/CardArticle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchMaterials } from '../redux/features/materials';

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
  const { items, } = useAppSelector((state) => state.materials);

  console.log({ items })
  const session = useAppSelector((state) => state.auth.session)
  const [selectedCategory, setActiveCategory] = useState(categories[0].id)

  useEffect(() => {
    dispatch(fetchMaterials())
  }, [])

  const onPressStart = ({
    url
  }: {
    url: string
  }) => {
    // create a lesson
    // create a textbook
    navigation.navigate('Lesson', {
      url
    })
  }

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerDateText}>July 19</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
            {session ? <View>
              {/* <Text style={styles.headerDateText}>s</Text> */}
              {/* login */}
              <Ionicons name="person-circle-outline" size={32} color="blue" />
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
                <View style={[{ justifyContent: "center", alignItems: "center", width: 96, height: 80, marginVertical: 24, borderBottomWidth: 4, borderBottomColor: "transparent" }, selectedCategory === category.id && { borderBottomColor: "#9FD1D5" }]}>
                  <Ionicons name={category.icon} size={24} color={selectedCategory === category.id ? "#9FD1D5" : "#242424"} />
                  <Text>{category.title}</Text>
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
              onPressStart={() => onPressStart({ url: item.url })}
            />
          ))
        }
        {
          items.map((item, index) => (
            <CardArticle
              type={item.type}
              title={item.name}
              imageSource={{ uri: item.url }}
              onPressStart={() => onPressStart({ url: item.url })}
            />
          ))
        }
      </ScrollView >
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
