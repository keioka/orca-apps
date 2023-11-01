import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Card, Button, Tab, TabView, ActivityIndicator } from 'react-native-paper';
import { BsArrowRightCircleFill, BsArrowLeftCircleFill } from 'react-icons/bs'; // Note: you need to find alternative icons that work with React Native, react-icons won't work
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const CardPhrase = ({
  data
}) => {
  const navigation = useNavigation();
  console.log({ data })
  const paraphrase = data.paraphrase.content
  const originalSentence = data.paraphrase.sentence.message.content
  const lesson = data.paraphrase.sentence.message.lesson
  const material = lesson.material

  function handlePressBackToLesson() {
    navigation.navigate('Lesson', { lessonId: lesson.id })
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text style={styles.phrase}>{originalSentence}</Text>
        <View style={styles.sectionIcon}>
          <Ionicons name="caret-down-outline" size={24} color="lightgreen" />
        </View>
        <Text style={styles.paraphrase}>{paraphrase}</Text>
        <View style={styles.sectionExample}>
          <Text style={styles.subtitle}>Context</Text>
          {/* <Text style={styles.meaning}>{example}</Text> */}
          <View style={{ flex: 1, flexDirection: "row", marginTop: 8 }}>
            {/* <Image source={{ uri: "https://media.cnn.com/api/v1/images/stellar/prod/230714140340-george-clooney-file-052423-restricted.jpg?c=16x9&q=h_720,w_1280,c_fill/f_webp" }} style={{ width: 64, height: 32 }} /> */}
            <View style={{ flex: 1, flexDirection: "row", marginLeft: 8, overflow: "hidden", flexGrow: 1 }}>
              <Text style={{ flex: 1, width: "100%", overflow: "hidden", flexWrap: "nowrap", flexGrow: 1 }}>{material.title}</Text>
            </View>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardContent}>
        <Button style={styles.btn} textColor="#242424" onPress={handlePressBackToLesson}>Back to Lesson</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    elevation: 0,
    shadowOpacity: 0,
    borderRadius: 4,
    width: '100%',
    // border: '1px solid #f4f4f4',
    backgroundColor: '#fff',
    paddingVertical: 24
  },
  cardContent: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#f4f4f4',
  },
  btn: {
    width: '100%',
  },
  phrase: {
    fontSize: 16,
  },
  paraphrase: {
    fontSize: 18,
  },
  meaning: {
    fontSize: 16,
    marginTop: 8,
  },
  sectionIcon: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionExample: {
    marginTop: 16,
  },
  subtitle: {
    fontWeight: 'bold',
    color: '#a4a4a4',
  }
  // ... Add more styles
});
