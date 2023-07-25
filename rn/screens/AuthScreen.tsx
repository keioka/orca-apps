import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, } from 'react-native'
import { supabase } from '../supabase'
import { Button, TextInput, Text } from 'react-native-paper'
import { useAppSelector } from '../redux/hooks'
import { useAppDispatch } from '../redux/hooks'
import { signUpWithEmail, signInWithEmail } from '../redux/features/auth'

export function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const session = useAppSelector((state) => state.auth.session)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (session) {
      navigation.navigate('Home')
    }
  })

  const handleSignup = async () => {
    dispatch(signUpWithEmail({ email, password }))
  }

  const handleSignin = async () => {
    dispatch(signInWithEmail({ email, password }))
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24 }}>Sign up</Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          style={{ backgroundColor: "#fff" }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          style={{ backgroundColor: "#fff" }}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button disabled={loading} onPress={handleSignin} mode="contained">Sign in</Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button disabled={loading} onPress={handleSignup} mode="contained">Sign up</Button>
      </View>
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