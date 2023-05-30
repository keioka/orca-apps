import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ShareMenu, { ShareMenuReactView } from "react-native-share-menu";
import VideoScreen from "./src/scenes/Video";

type SharedItem = {
  mimeType: string,
  data: string,
  extraData: any,
};

export default function App() {
  const [sharedData, setSharedData] = useState(null);
  const [sharedMimeType, setSharedMimeType] = useState(null);

  const handleShare = useCallback((item?: SharedItem) => {
    if (!item) {
      return;
    }

    const { mimeType, data, extraData } = item;

    setSharedData(data);
    setSharedMimeType(mimeType);
    // You can receive extra data from your custom Share View
    console.log(extraData);
  }, []);

  useEffect(() => {
    ShareMenu.getInitialShare(handleShare);
  }, []);

  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(handleShare);

    return () => {
      listener.remove();
    };
  }, []);

  if (!sharedMimeType && !sharedData) {
    // The user hasn't shared anything yet
    return <VideoScreen />;
  }

  if (sharedMimeType === "text/plain") {
    // The user shared text
    return <Text>Shared text: {sharedData}</Text>;
  }

  return (
    <View style={styles.container}>
      <VideoScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
