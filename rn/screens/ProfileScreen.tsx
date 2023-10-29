import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, } from 'react-native'
import { Button, TextInput, Text } from 'react-native-paper'
import { useAppSelector } from '../redux/hooks'
import { useAppDispatch } from '../redux/hooks'
import { signUpWithEmail, signInWithEmail } from '../redux/features/auth'

export function ProfileScreen({ navigation }) {


  return (
    <View style={styles.container}>
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
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})