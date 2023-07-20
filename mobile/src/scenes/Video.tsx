import React, { useRef, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
// import YoutubePlayer from "react-native-youtube-iframe";
import { Button, Card, SegmentedButtons, Text } from 'react-native-paper';

const FirstRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#ff4081' }}>
    <Text>First Tab</Text>
  </View>
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }}>
    <Text>Second Tab</Text>
  </View>
);

export default function VideoScreen() {
  const playerRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [videoId, setVideoId] = useState("6n3pFFPSlW4");
  const [time, setTime] = useState({ start: 0, end: 0 });
  const [index, setIndex] = React.useState(0);

  const onStateChange = (state) => {
    if (state === "ended") {
      setPlaying(false);
      setShouldPlay(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.video}>
        <Text>G</Text>
      </View>
      <SafeAreaView style={styles.buttonsWrapper}>
        <SegmentedButtons
          value={index}
          onValueChange={setIndex}
          style={styles.buttons}
          buttons={[
            {
              value: 0,
              label: 'Summary',
              style: {
                borderRadius: 0,
              }
            },
            {
              value: 1,
              label: 'Transcript',
              style: {
                borderRadius: 0,
              }
            },
            {
              value: 2,
              label: 'Vocabulary',
              style: {
                borderRadius: 0,
              }
            },
          ]}
        />
      </SafeAreaView>
      <View style={{ flex: 1, minWidth: "100%", padding: 16 }}>
        {index === 0 && <SummaryTab />}
        {index === 1 && <TranscriptTab />}
        {index === 2 && <VocabularyTab />}
      </View>
    </View>
  );
}

function SummaryTab() {
  return (
    <View style={{ flex: 1, minWidth: "100%" }}>
      <Card style={{ marginBottom: 8 }}>
        <Card.Content>
          <Text variant="bodyMedium">Card title</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

function TranscriptTab() {
  return (
    <View style={{ flex: 1, minWidth: "100%" }}>
      <Card style={{ marginBottom: 8 }}>
        <Card.Content>
          <Text variant="bodySmall">0:02</Text>
          <Text variant="bodyMedium">Card title</Text>
          <Text variant="bodyMedium">Card content</Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 8 }}>
        <Card.Content>
          <Text variant="bodySmall">0:02</Text>
          <Text variant="bodyMedium">Card title</Text>
          <Text variant="bodyMedium">Card content</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

function VocabularyTab() {
  return (
    <View style={{ flex: 1, minWidth: "100%" }}>
      <Card style={{ marginBottom: 8 }}>
        <Card.Content>
          <Text variant="titleMedium">Rational</Text>
          <Text variant="bodyMedium">Card content</Text>
          <Text variant="bodySmall">0:02</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  video: {
    height: 300,
    minWidth: "100%",
    backgroundColor: "black"
  },
  buttonsWrapper: {
    minWidth: "100%",
  },
  buttons: {
    borderRadius: 0,
  }
});