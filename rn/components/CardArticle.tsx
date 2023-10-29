import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { Card, Title, Paragraph, Text, Chip } from 'react-native-paper';
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
  <Card style={styles.card} elevation={0}>
    <TouchableOpacity onPress={onPressStart}>
      <Card.Content style={styles.cardContent}>
        {/* <View style={styles.sectionPublisher}>
        <Image source={{ uri: item.publisher.imageUrl }} style={styles.logoPublisher} />
        <Title style={styles.title}>{item.title}</Title>
      </View> */}
        {/* <Paragraph>{item.content}</Paragraph> */}
        <Title style={styles.title}>{item.title}</Title>
        <View style={{ flex: 2 }}>
          {item.type === 'video' ?
            // <WebView
            //   style={styles.youtubeView}
            //   javaScriptEnabled={true}
            //   domStorageEnabled={true}
            //   source={imageSource || { uri: item.url }}
            // /> :
            null :
            <>
              {item.imageUrl ? <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} /> : null}
            </>
          }
        </View>
      </Card.Content>
    </TouchableOpacity>
    <Card.Actions style={styles.cardAction}>
      <View style={styles.sectionActionButtons}>
        {/* <Button onPress={onPressStart} style={styles.btn} textColor="#fff" isGradient={!!lessonId}>{lessonId ? "Resume" : "Start"}</Button> */}
        {lessonId &&
          <Chip style={styles.containerChip} textStyle={styles.textChip} compact>
            Already
          </Chip>
        }
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
    elevation: -1,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    backgroundColor: '#fff',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    marginTop: 16,
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
    marginTop: -8,
    flexDirection: 'row',
  },
  cardAction: {
    width: '100%',
    marginTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 10,
    fontSize: 14,
    lineHeight: 18,
    color: "#242424",
    marginRight: 8
  },
  textPublisherName: {
    fontSize: 11,
  },
  containerChip: {
    height: 22,
    padding: 0,
    margin: 0,
  },
  textChip: {
    fontSize: 8,
    padding: 0,
    margin: 0,
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
  }
});

