import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Paragraph, Chip } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { Button } from './Button';
import { Image } from 'expo-image';
import { Text, Title } from './Text';
import moment from 'moment';
import { i18n } from '../locales';

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
    const domain = new URL(url).host;
    const size = 24
    // const faviconUrl = `${domain}/favicon.ico`;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    return faviconUrl
  } catch (err) {
    console.error(err)
    return null
  }
}

const formatCategory = {
  ai: "AI",
  business: "Business",
  eu_stock: "🇪🇺 EU Stock",
  fintech: "Fintech",
  israel_hamas: "Israel-Hamas",
  jp_economy: "🇯🇵Japan | Economy",
  jp_news: "🇯🇵Japan | News",
  jp_stock: "🇯🇵Japan | Stock",
  marketing: "Marketing",
  metaverse: "Metaverse",
  russia_ukraine: "Russia-Ukraine",
  science: "Science",
  sdgs: "SDGs (Sustainable Development Goals)",
  startup: "Startup",
  tech: "Tech",
  us_stock: "🇺🇸US Stock",
  web3: "Web3",
  world_economy: "🌍World Economy",
  world_news: "🌍World News"
};

export const CardOriginalArticle = ({
  item,
  imageSource,
  buttonTitle,
  onPressStart,
  hideSaveButton,
  lessonId
}:
  CardArticleProps
) => {
  const { categoryExternal } = item
  return (
    <TouchableOpacity onPress={onPressStart}>
      <Card style={styles.card} elevation={0}>
        <View style={{ width: "auto", position: "absolute", top: 10, left: 10, zIndex: 2 }}>
          <Chip style={styles.containerCategoryChip} textStyle={styles.textChip}>{formatCategory[categoryExternal] || formatCategory["world_news"]}</Chip>
        </View>
        <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} />
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardContentBody}>
            <Title style={styles.title}>{item.title}</Title>
          </View>
        </Card.Content>
        <View style={styles.cardAction}>
          <Text style={{ fontSize: 12 }}>{item.publishedAt ? moment(item.publishedAt).fromNow() : null}</Text>
          <View style={styles.sectionActionButtons}>
            {lessonId &&
              <Chip style={styles.containerChip} textStyle={styles.textChip} compact>
                {i18n.t("alreadyStarted")}
              </Chip>
            }
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    elevation: -1,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    backgroundColor: '#fff',
    width: 320,
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
    width: 320,
    height: 240,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    resizeMode: 'contain'
  },
  cardContent: {
    flexDirection: 'column',
    width: "100%",
    paddingHorizontal: 0
  },
  cardContentBody: {
    width: "100%",
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 0,
    flexWrap: 'wrap'
  },
  cardAction: {
    // paddingHorizontal: 18,
    flexDirection: 'row',
    width: '100%',
    marginTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    paddingTop: 1
  },
  textPublisherName: {
    fontSize: 12,
  },
  containerChip: {
    height: 22,
    padding: 0,
    margin: 0,
    backgroundColor: "#FFD744"
  },
  containerCategoryChip: {
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

