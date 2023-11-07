import { useState, useMemo, useEffect } from 'react'
import { TouchableOpacity, Alert, StyleSheet, View, ScrollView, Dimensions } from 'react-native'
import { Button, TextInput, Modal, Portal, Text, PaperProvider, Checkbox } from 'react-native-paper'
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchPublishers } from '../redux/features/publishers';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { capitalize } from "lodash"
import { Image } from 'expo-image';
import { createFollowPublishers, clearHasSuccessCreateFollow, fetchFollowPublishers } from '../redux/features/publishers';
import { unionBy } from 'lodash';
import { categories } from '../helpers/categories';

const screenWidth = Dimensions.get('window').width;
const categorySize = (screenWidth - (4 * 16)) / 2; // Adjusting for three categories per row and assuming 16 as the margin

export function CategoryScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState();
  const publishers = useAppSelector((state) => state.publisher.publishers);
  const hasSuccessCreateFollow = useAppSelector((state) => state.publisher.hasSuccessCreateFollow);
  const followIds = useAppSelector((state) => state.publisher.followPublishers);
  const [selectedPublisherIds, setSelectedPublisherIds] = useState([]);

  useEffect(() => {
    dispatch(fetchFollowPublishers())
  }, [])

  useEffect(() => {
    if (!followIds) return
    const followPublisherIds = followIds.map((followPublisher) => followPublisher.publisherId)
    setSelectedPublisherIds(unionBy([...selectedPublisherIds, ...followPublisherIds], (id) => id))
  }, [followIds])

  useEffect(() => {
    if (hasSuccessCreateFollow) {
      dispatch(clearHasSuccessCreateFollow())
      navigation.navigate("Main")
    }
  }, [hasSuccessCreateFollow])

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  }

  const handleSelectPublisher = (publisherId: string) => {
    if (selectedPublisherIds.includes(publisherId)) {
      setSelectedPublisherIds(selectedPublisherIds.filter((id) => id !== publisherId))
    }
    else {
      setSelectedPublisherIds([...selectedPublisherIds, publisherId])
    }
  }

  const handleClearCategory = () => {
    setSelectedCategory();
  }

  const selectedCountsByCategorySlug = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.slug] = publishers.filter(
        (publisher) => publisher.category === category.slug && selectedPublisherIds.includes(publisher.id)
      ).length;
      return acc;
    }, {})
  }, [categories, publishers, selectedPublisherIds])

  useEffect(() => {
    dispatch(fetchPublishers())
  }, [])

  const selectedCategoryPublishers = useMemo(() => {
    if (selectedCategory) {
      return publishers.filter((publisher) => publisher.category === selectedCategory.slug)
    }
    return []
  }, [publishers, selectedCategory])

  const handleSubmit = () => {
    dispatch(createFollowPublishers(selectedPublisherIds))
  }

  if (selectedCategory) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClearCategory}>
            <Ionicons name="close" size={32} color="black" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.feedContainer}>
          <View style={styles.titleContainer}>
            <Ionicons name={selectedCategory.icon} size={32} color="black" />
            <Text>{selectedCategory.title}</Text>
          </View>
          {
            selectedCategoryPublishers.map((publisher) => {
              const isSelected = selectedPublisherIds.includes(publisher.id)
              return (
                <RSSSelector
                  key={publisher.id}
                  title={publisher.name}
                  url={publisher.rssUrl}
                  imageUrl={publisher.imageUrl || fetchFavicon(publisher.rssUrl)}
                  onPress={() => handleSelectPublisher(publisher.id)}
                  isSelected={isSelected}
                />)
            })
          }
        </ScrollView>
        <PaperProvider>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              style={{ padding: 32 }}
              contentContainerStyle={styles.containerStyle}
            >
              <View>

              </View>
            </Modal>
          </Portal>
        </PaperProvider>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <View style={{ width: "100%", justifyContent: "flex-start" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={32} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCategory}>
          <Text style={styles.headerDateText}>Follow RSS</Text>
          <View>
            <Text><Text style={styles.countPublishers}>{selectedPublisherIds.length}</Text> feeds</Text>
            <Text>selected</Text>
          </View>

        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {categories.map((category) => {
            return (
              <View key={category.title} style={styles.selectorWrapper}>
                <CategorySelector
                  title={category.title}
                  icon={category.icon}
                  onPress={() => handleSelectCategory(category)}
                  selectedCount={selectedCountsByCategorySlug[category.slug] || 0}
                />
              </View>
            )
          })}
        </ScrollView>

      </View >
      <Button
        onPress={handleSubmit}
        textColor="#fff"
        mode="contained"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        style={{
          width: "100%",
          backgroundColor: "#2FABE8",
          borderRadius: 0,
          height: 64,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Complete
      </Button>
    </>
  )
}

function CategorySelector({ title, icon, onPress, selectedCount }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.categorySelector}>
        <Ionicons name={icon} size={32} color="black" />
        <Text>{capitalize(title)}</Text>
        {selectedCount > 0 &&
          <View style={{ width: 24, height: 24, backgroundColor: "red", borderRadius: 24, justifyContent: "center", alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: '#fff' }}>{`${selectedCount}`}</Text>
          </View>
        }
      </View>
    </TouchableOpacity>
  )
}

function fetchFavicon(url) {
  // Try fetching favicon.ico from the root domain first
  try {
    //
    const domain = new URL(url).origin;
    const size = 24
    // const faviconUrl = `${domain}/favicon.ico`;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    return faviconUrl
  } catch (err) {
    console.error(err)
    return ""
  }
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M | azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj ? j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

function RSSSelector({ title, url, icon, imageUrl, onPress, isSelected = true }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: "100%" }}>
      <View style={styles.rssSelector}>
        <Checkbox.Android status={isSelected ? 'checked' : 'unchecked'} />
        <Image
          style={styles.publisherImg}
          source={imageUrl}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
        />
        <Ionicons name={icon} size={32} color="black" />
        <Text style={{ flex: 1, flexShrink: 1, flexWrap: 'wrap' }}>{title.trim()}</Text>
      </View>
    </TouchableOpacity >
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    width: "100%",
    alignItems: "flex-start",
  },
  titleContainer: {
    paddingBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorWrapper: {
    margin: 8,
  },
  containerStyle: {
    backgroundColor: 'white',
    padding: 20,
    width: "100%",
    height: "100%",
    borderRadius: 8
  },
  categorySelector: {
    width: categorySize,
    height: categorySize,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8
  },
  rssSelector: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    // height: 64,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    marginBottom: 8,
  },
  feedContainer: {
    width: "100%",
    marginTop: 48,
    // paddingHorizontal: 48,
    paddingBottom: 48,
  },
  publisherImg: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 8,
  },
  headerCategory: {
    width: '100%',
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerDateText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  countPublishers: {
    fontSize: 14,
    fontWeight: 'bold',
  }
})
