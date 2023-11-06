import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, } from 'react-native'
import LottieView from 'lottie-react-native';

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