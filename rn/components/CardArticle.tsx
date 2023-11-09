import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Paragraph, Chip } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { Button } from './Button';
import { Image } from 'expo-image';
import { Text, Title } from './Text';
import moment from 'moment';

interface CardArticleProps {
  item: {
    type: string;
    title: string;
    content: string;
    imageUrl?: string;
    url?: string;
  },
  imageSource: any;
  buttonTitle: string;
  onPressStart: () => void;
  hideSaveButton?: boolean;
  lessonId?: string;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M | azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj ? j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


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
    return null
  }
}

export const CardArticle = ({
  item,
  imageSource,
  buttonTitle,
  onPressStart,
  hideSaveButton,
  lessonId
}:
  CardArticleProps
) => (
  <Card style={styles.card} elevation={0}>
    <TouchableOpacity onPress={onPressStart}>
      <Card.Content style={styles.cardContent}>
        {item.publisher &&
          <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
            <Image
              style={styles.publisherImg}
              source={fetchFavicon(item.publisher.rssUrl) || item.publisher.imageUrl}
              placeholder={blurhash}
              contentFit="cover"
              transition={1000}
            />
            <Text style={styles.textPublisherName}>{item.publisher.name}</Text>
          </View>
        }
        <View style={styles.cardContentBody}>
          <Title style={styles.title}>{item.title}</Title>
          <View style={{ flex: 2 }}>
            {item.type === 'video' ?
              null :
              <>
                {item.imageUrl ? <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} /> : null}
              </>
            }
          </View>
        </View>
      </Card.Content>
    </TouchableOpacity>
    <View style={styles.cardAction}>
      <Text style={{ fontSize: 12 }}>{item.publishedAt ? moment(item.publishedAt).fromNow() : null}</Text>
      <View style={styles.sectionActionButtons}>
        {lessonId &&
          <Chip style={styles.containerChip} textStyle={styles.textChip} compact>
            Already started
          </Chip>
        }
      </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    elevation: -1,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    backgroundColor: '#fff',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    marginTop: 16,
    paddingVertical: 8
  },
  youtubeView: {
    width: "100%",
    height: 60,
    borderRadius: 8,
    resizeMode: 'contain'
  },
  cardCover: {
    width: 60,
    height: 60,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    resizeMode: 'contain'
  },
  cardContent: {
    flexDirection: 'column',
    width: "100%",
  },
  cardContentBody: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardAction: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    width: '100%',
    marginTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 10,
    fontSize: 16,
    lineHeight: 18,
    marginRight: 8
  },
  textPublisherName: {
    fontSize: 12,
  },
  containerChip: {
    height: 22,
    padding: 0,
    margin: 0,
  },
  textChip: {
    fontSize: 10,
    padding: 0,
    margin: 0,
    marginTop: 4,
    lineHeight: 0
  },
  btn: {
    borderRadius: 20,
    backgroundColor: '#9FD1D5',
    borderWidth: 0,
    height: 1,
  },
  btnSave: {
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPublisher: {
    width: "auto",
    height: 60,
    aspectRatio: 1.5,
    resizeMode: 'contain',
    marginRight: 8
  },
  sectionPublisher: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionButtons: {
    flexDirection: 'row',
  },
  publisherImg: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 8,
    resizeMode: 'contain'
  },
});

