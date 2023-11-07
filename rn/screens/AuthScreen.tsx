import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, KeyboardAvoidingView } from 'react-native'
import { Button, TextInput, Text, Portal, Modal } from 'react-native-paper'
import { useAppSelector } from '../redux/hooks'
import { useAppDispatch } from '../redux/hooks'
import { signUpWithEmail, signInWithEmail } from '../redux/features/auth'

export function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isSignin, setSignin] = useState(false)
  const errorSignupMessage = useAppSelector((state) => state.auth.errorSignupMessage)
  const errorSigninMessage = useAppSelector((state) => state.auth.errorSigninMessage)
  const signupLoading = useAppSelector((state) => state.auth.signupLoading)
  const singinLoading = useAppSelector((state) => state.auth.singinLoading)

  const dispatch = useAppDispatch()

  const handleSignupGoogle = async () => {
    dispatch(signUpWithEmail({ email, password }))
  }

  const handleSignup = async () => {
    dispatch(signUpWithEmail({ email, password }))
  }

  const handleSignin = async () => {
    dispatch(signInWithEmail({ email, password }))
  }

  const isSignupDisabled = !email || !password || !passwordConfirmation || password !== passwordConfirmation
  const isSigninDisabled = !email || !password
  const passwordError = password && passwordConfirmation && password !== passwordConfirmation ? "Password confirmation does not match" : null

  return (
    <View style={styles.container}>
      <Portal style={{ padding: 8 }}>
        <Modal
          visible={signupLoading || singinLoading}
          dismissable={false}
          contentContainerStyle={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
        >
          <Text style={{ fontSize: 24, textAlign: "center" }}>Loading...</Text>
        </Modal>
      </Portal>
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={64} style={{ width: "90%" }} contentContainerStyle={{ borderTopColor: "#f4f4f4", borderTopWidth: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>

        {isSignin && <>
          <Text style={{ fontSize: 24 }}>Sign in</Text>
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
          <View style={styles.sectionError}>
            {errorSigninMessage && <Text style={styles.alert}>{errorSigninMessage}</Text>}
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button disabled={singinLoading} onPress={handleSignin} mode="contained" disabled={isSigninDisabled}>Sign in</Button>
          </View>
          <View style={styles.verticallySpaced}>
            <Button onPress={() => setSignin(false)} mode="text" >Sign up</Button>
          </View>
        </>
        }
        {!isSignin && <>
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
          <View style={styles.verticallySpaced}>
            <TextInput
              label="Password Confirmation"
              leftIcon={{ type: 'font-awesome', name: 'lock' }}
              onChangeText={(text) => setPasswordConfirmation(text)}
              value={passwordConfirmation}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize={'none'}
              style={{ backgroundColor: "#fff" }}
            />
          </View>
          <View style={styles.sectionError}>
            {passwordError && <Text style={styles.alert}>{passwordError}</Text>}
            {errorSignupMessage && <Text style={styles.alert}>{errorSignupMessage}</Text>}
          </View>
          <View style={styles.verticallySpaced}>
            <Button disabled={signupLoading} onPress={handleSignup} mode="contained" disabled={isSignupDisabled}>Sign up</Button>
          </View>
          <View style={styles.verticallySpaced}>
            <Button onPress={() => setSignin(true)} mode="text">Sign in</Button>
          </View>
        </>
        }
      </KeyboardAvoidingView>
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
    width: "100%"
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  sectionError: {
    height: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  mt20: {
    marginTop: 20,
  },
  alert: {
    color: "red",
  }
})