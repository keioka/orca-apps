import * as React from 'react';
import { Dimensions, Text, View, ScrollView } from 'react-native';
import { CardOriginalArticle } from './CardOriginalArticle';

const newsSample = [
  {
    title: 'Tin 1',
    image: 'https://i1-vnexpress.vnecdn.net/2021/07/24/'
  },
  {
    title: 'Tin 2',
    image: 'https://i1-vnexpress.vnecdn.net/2021/07/24/'
  },
  {
    title: 'Tin 3',
    image: 'https://i1-vnexpress.vnecdn.net/2021/07/24/'
  },
]
export function NewsCarousel({ news = newsSample, onPressStart }) {
  const width = Dimensions.get('window').width;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {news.map((item, index) => (
        <View style={{ marginHorizontal: 16 }}>
          <CardOriginalArticle item={item} onPressStart={() => onPressStart({ url: item.url, lessonId: item.lessonId, materialId: item.id, lessonId: item.lessonId })} />
        </View>
      ))}
    </ScrollView>
  );
}