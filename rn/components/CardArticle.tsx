import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { Button } from './Button';

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
  <Card style={styles.card}>
    {item.type === 'video' ?
      <WebView
        style={styles.youtubeView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={imageSource || { uri: item.url }}
      /> :
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} />
    }
    <Card.Content style={styles.cardContent}>
      <View style={styles.sectionPublisher}>
        <Image source={{ uri: item.publisher.imageUrl }} style={styles.logoPublisher} />
      </View>
      <Title style={styles.title}>{item.title}</Title>
      <Paragraph>{item.content}</Paragraph>
    </Card.Content>
    <Card.Actions style={styles.cardAction}>
      <View style={styles.sectionActionButtons}>
        <Button onPress={onPressStart} style={styles.btn} textColor="#fff" isGradient={!!lessonId}>{lessonId ? "Resume" : "Start"}</Button>
        {!hideSaveButton &&
          <TouchableOpacity onPress={onPressStart} style={styles.btnSave} textColor="#242424" >
            <Ionicons name="bookmark" size={18} color="#c6c6c6" />
          </TouchableOpacity>
        }
      </View>
    </Card.Actions>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    margin: 10,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#fff',
    width: '90%',
  },
  youtubeView: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  cardCover: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    resizeMode: 'contain'
  },
  cardContent: { marginTop: -8 },
  cardAction: {
    width: '100%',
    marginTop: -16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 18,
    color: "#242424",
  },
  textPublisherName: {
    fontSize: 11,
  },
  btn: {
    borderRadius: 20,
    backgroundColor: '#9FD1D5',
    borderWidth: 0,
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
  }
});

