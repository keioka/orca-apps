import * as React from 'react';
import { Dimensions, Text, View } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';

const newsSample = [
  {
    title: 'Covid-19: Việt Nam ghi nhận thêm 9.362 ca mắc mới, cao nhất từ trước đến nay',
    image: 'https://i1-vnexpress.vnecdn.net/2021/07/24/'
  },
]
export function NewsCarousel({ news = newsSample }) {
  const width = Dimensions.get('window').width;
  return (
    <View style={{ flex: 1 }}>
      {/* <Carousel
        loop
        width={width}
        height={width / 2}
        autoPlay={true}
        data={[...new Array(6).keys()]}
        scrollAnimationDuration={1000}
        onSnapToItem={(index) => console.log('current index:', index)}
        renderItem={({ index }) => (
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              justifyContent: 'center',
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 30 }}>
              {index}
            </Text>
          </View>
        )}
      /> */}
    </View>
  );
}