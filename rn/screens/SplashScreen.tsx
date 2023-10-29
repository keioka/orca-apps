import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, } from 'react-native'
import LottieView from 'lottie-react-native';

export function SplashScreen({ navigation }) {

  return (
    <View style={styles.container}>
      <LottieView
        source={{ uri: "https://lottie.host/a52d99bc-2c3a-4832-b386-4a3f038be090/nYTA3DwoEP.json" }}
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