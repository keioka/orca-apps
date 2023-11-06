import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { CardArticle } from '../components/CardArticle';
import {
  BarChart,
} from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useEffect } from 'react';
import { fetchLessons, createLesson } from '../redux/features/lessons';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#007991",
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: "#007991",
  backgroundGradientToOpacity: 0.7,
  decimalPlaces: 0, // optional, defaults to 2dp
  color: (opacity = 1) => `rgba(255, 255, 255, 1)`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 1,
  useShadowColorFromDataset: false, // optional
  style: {
    paddingLeft: 0,
    borderRadius: 16,
  },
  propsForDots: {
    r: "0",
    strokeWidth: "0",
    stroke: "#fff"
  },
  propsForVerticalLabels: {
    style: {
      paddingLeft: 0,
    }
  },
  propsForHorizontalLabels: {
    style: {
      paddingLeft: 0,
    }
  },
};

export function HistoryScreen({ navigation }) {
  const { lessons } = useAppSelector((state) => state.lesson);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLessons())
  }, []);

  const onPressStart = ({ url, lessonId }: { url: string, lessonId: string }) => {
    if (!lessonId) {
      console.error("Lesson ID is required")
      throw new Error("Lesson ID is required")
    }
    navigation.navigate('Lesson', { url, lessonId })
  }

  const data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [3, 2, 1, 5, 6, 3, 2]
      }
    ]
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContainer}>
        {/* <View style={styles.sectionSubtitle}>
          <Text style={styles.subtitle}>Progress this week</Text>
        </View> */}
        <View style={{ width: "90%" }}>
          {/* <BarChart
            style={{ marginVertical: 8, borderRadius: 16 }}
            data={data}
            width={screenWidth * 0.9}
            height={220}
            yAxisLabel=""
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={{
              marginVertical: 0,
              paddingLeft: 0,
              borderRadius: 16,
            }}
          /> */}
        </View>
        <View style={styles.sectionSubtitle}>
          <Text style={styles.subtitle}>Past Lessons</Text>
        </View>
        {/* {feed.map((item, index) => (
          <CardArticle
            item={item}
            onPressStart={() => onPressStart({ url: item.url, materialId: item.id })}
          />
        ))} */}
        {lessons && lessons.map((item, index) => (
          <CardArticle
            key={`lesson_${item.id}`}
            item={item.material}
            onPressStart={() => onPressStart({ url: item.material.url, lessonId: item.id })}
            lessonId={item.id}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 12,
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  sectionSubtitle: {
    paddingTop: 24,
    paddingBottom: 8,
    width: '90%',
    justifyContent: 'flex-start',
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 24,
  }
});
