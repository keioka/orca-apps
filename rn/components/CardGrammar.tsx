import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Card, Button, Tab, TabView, ActivityIndicator } from 'react-native-paper';
import { BsArrowRightCircleFill, BsArrowLeftCircleFill } from 'react-icons/bs'; // Note: you need to find alternative icons that work with React Native, react-icons won't work
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ContentGrammar, GrammarFix } from './ContentGrammar';

// ... (All other constant declarations and async functions remain the same)

const locale = {
  detail: {
    en: "Detail",
    ja: "詳細"
  },
  rephrase: {
    en: "Rephrase",
    ja: "言い換え表現"
  },
  grammar: {
    en: "Grammar",
    ja: "文法チェック"
  },
  mistake: {
    en: "Mistake",
    ja: "間違い"
  },
  reason: {
    en: "Reason",
    ja: "理由"
  },
  fix: {
    en: "Fix",
    ja: "修正提案"
  }
}


export const CardGrammar = ({
  data
}: {
  data: GrammarFix
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <ContentGrammar data={data} />
      </Card.Content>
      <Card.Actions style={styles.cardContent}>
        <Button style={styles.btn} textColor="#242424">Back to Lesson</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    elevation: 0,
    shadowOpacity: 0,
    borderRadius: 4,
    width: '90%',
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
