import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Appbar, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ProgressBar, MD3Colors } from 'react-native-paper';

export const Browser = ({ initialUrl, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [progress, setProgress] = useState(0);

  const onNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
  };

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <View style={{ width: "100%", backgroundColor: "#fff", paddingTop: 16, borderBottomColor: "#f1f1f1", borderBottomWidth: 1 }}>
        {/* <Appbar.Header style={{ backgroundColor: "#fff" }}>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title={currentUrl} />
        </Appbar.Header> */}
        <View style={{ flexDirection: "row", paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1 }}>
            <View style={{ borderRadius: 8, justifyContent: "center", alignItems: "center", height: 42 }}>
              <Ionicons name="close-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 7, backgroundColor: "#f4f4f4", padding: 8, borderRadius: 8, justifyContent: "center", height: 42, width: "100%" }}>
            <Text style={{ color: "#242424", overflow: "hidden" }}>{currentUrl}</Text>
          </View>
        </View>
        {progress !== 1 ? <ProgressBar
          animatedValue={progress}
          progress={0}
          color="blue"
          style={{
            marginTop: 8,
            width: "100%",
            height: 3
          }}
        /> : <View style={{ height: 11 }} />}
      </View>
      <WebView
        source={{ uri: currentUrl }}
        onNavigationStateChange={onNavigationStateChange}
        mediaPlaybackRequiresUserAction
        onLoadProgress={({ nativeEvent }) => {
          const loadingProgress = nativeEvent.progress;
          setProgress(loadingProgress);
        }}
      />
    </View>
  );
};
