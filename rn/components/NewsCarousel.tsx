import * as React from 'react';
import { Dimensions, Text, View, ScrollView } from 'react-native';
import { CardOriginalArticle } from './CardOriginalArticle';

export function NewsCarousel({ news = newsSample, onPressStart }) {
  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      horizontal
      style={{ paddingLeft: 16 }}
    >
      {news && news.map((item, index) => (
        <View style={{ marginRight: 16 }}>
          <CardOriginalArticle item={item} lessonId={item.lessonId} onPressStart={() => onPressStart({ url: item.url + "?mode=embed", lessonId: item.lessonId, materialId: item.id, lessonId: item.lessonId })} />
        </View>
      ))}
    </ScrollView>
  );
}