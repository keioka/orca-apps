import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { Button } from './Button';

interface CardArticleProps {
  type: string;
  title: string;
  content: string;
  url?: string;
  imageSource: any;
  buttonTitle: string;
  onPressStart: () => void;
  hideSaveButton?: boolean;
  lessonId?: string;
}

export const CardArticle = ({
  type,
  title,
  content,
  imageSource,
  buttonTitle,
  onPressStart,
  hideSaveButton,
  lessonId
}:
  CardArticleProps
) => (
  <Card style={styles.card}>
    {type === 'video' ?
      <WebView
        style={styles.youtubeView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={imageSource}
      /> :
      <Card.Cover source={imageSource} style={styles.cardCover} />
    }
    <Card.Content style={styles.cardContent}>
      <Title style={styles.title}>{title}</Title>
      <Paragraph>{content}</Paragraph>
    </Card.Content>
    <Card.Actions style={styles.cardAction}>
      <Button onPress={onPressStart} style={styles.btn} textColor="#fff" isGradient={!!lessonId}>{lessonId ? "Resume" : "Start"}</Button>
      {!hideSaveButton &&
        <TouchableOpacity onPress={onPressStart} style={styles.btnSave} textColor="#242424" >
          <Ionicons name="bookmark" size={18} color="#c6c6c6" />
        </TouchableOpacity>
      }
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
  cardCover: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  cardContent: { marginTop: 12 },
  cardAction: {
    marginTop: -16,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    color: "#242424",
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
  }
});

