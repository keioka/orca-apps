import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, Button } from 'react-native'
import LottieView from 'lottie-react-native';
import * as Updates from 'expo-updates';
import { NativeModules } from "react-native";
import { Text } from '../components/Text';


export function ErrorScreen() {

  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: "https://lottie.host/0167aedf-1b03-49b8-b856-b651d652342a/5a4i8u2TLs.json" }}
        autoPlay
        loop
        style={{
          width: 400,
          height: 400,
        }}
      />
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Something went wrong</Text>
      <Button
        title="Reload the app"
        onPress={() => {
          if (process.env.NODE_ENV === 'development') {
            NativeModules.DevSettings.reload();
          } else {
            Updates.reloadAsync();
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
})