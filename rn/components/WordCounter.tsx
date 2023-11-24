import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Text } from './Text';
import LottieView from 'lottie-react-native';

export function WordCounter({ count }: { count: number }) {
  const [prevTarget, setPrevTarget] = useState(count);
  const lottieAnimation = useRef(null);
  const animatedValue = useRef(new Animated.Value(prevTarget)).current;
  const scale = useRef(new Animated.Value(1)).current; // Scale animation

  useEffect(() => {
    // Sequence for pop-up effect
    Animated.sequence([
      // First, scale up the text
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 500,
        useNativeDriver: true,
      }),
      // Then, change the number
      Animated.timing(animatedValue, {
        toValue: count,
        duration: 500,
        useNativeDriver: true,
      }),
      // Finally, scale down the text
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    lottieAnimation.current?.reset();
    lottieAnimation.current?.play();
    setPrevTarget(count);
  }, [count, animatedValue, scale]);


  // Interpolating the number
  const animatedNumber = animatedValue.interpolate({
    inputRange: [prevTarget, count],
    outputRange: [prevTarget.toString(), count.toString()]
  });

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        backgroundColor: "#fff",
        flexDirection: "column",
        flexGrow: 1,
        width: 64,
        height: 64,
        paddingLeft: 8,
        borderTopLeftRadius: 64,
        borderBottomLeftRadius: 64,
        // borderRadiusTopLeft: 64,
        // borderRadiusTopRight: 64,
        backgroundColor: "#2FABE8",
      }}
    >
      <Animated.Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>{animatedNumber}</Animated.Text>
      <Text style={{ fontSize: 12, fontWeight: "bold", color: "lightgray", color: "#fff" }} weight='SemiBold'>words</Text>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
        <LottieView
          ref={lottieAnimation}
          autoPlay={false}
          loop={false}
          source={{ uri: "https://lottie.host/c185e4f9-762d-418b-8bf2-60e1a8145632/ICvPCEG1xY.json" }}
          speed={0.5}
          style={{ width: 128, height: 128 }}
        />
      </View>
    </View>
  )
}