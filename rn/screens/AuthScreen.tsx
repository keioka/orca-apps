import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import { Button, TextInput, Portal, Modal } from 'react-native-paper'
import { useAppSelector } from '../redux/hooks'
import { useAppDispatch } from '../redux/hooks'
import { signUpWithEmail, signInWithEmail } from '../redux/features/auth'
import { i18n } from '../locales'
import { Text } from '@/components/Text'
import { analytics, ACTION } from '../helpers/mixpanel'

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
    analytics.track(ACTION.signup)
    dispatch(signUpWithEmail({ email, password }))
  }

  const handleSignin = async () => {
    analytics.track(ACTION.login)
    dispatch(signInWithEmail({ email, password }))
  }

  const isSignupDisabled = !email || !password || !passwordConfirmation || password !== passwordConfirmation
  const isSigninDisabled = !email || !password
  const passwordError = password && passwordConfirmation && password !== passwordConfirmation ? "Password confirmation does not match" : null

  return (
    <View style={styles.container}>
      <Portal style={{ padding: 24 }}>
        <Modal
          visible={signupLoading || singinLoading}
          dismissable={false}
          contentContainerStyle={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
        >
          <Text style={{ fontSize: 12, textAlign: "center" }}>Loading...</Text>
        </Modal>
      </Portal>
      <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 48 }}>
        <Image source={require('../assets/logo.png')} style={{ width: 100, height: 100 }} />
        <Text weight='Bold' style={{ fontSize: 24 }}>ORCA</Text>
      </View>
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={64} style={{ width: "90%" }} contentContainerStyle={{ borderTopColor: "#f4f4f4", borderTopWidth: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>

        {isSignin && <>
          <Text style={{ fontSize: 24 }}>{i18n.t("login")}</Text>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={i18n.t("email")}
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
              label={i18n.t("password")}
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
            <Button disabled={singinLoading} onPress={handleSignin} mode="contained" disabled={isSigninDisabled}>{i18n.t("loginAction")}</Button>
          </View>
          <View style={styles.verticallySpaced}>
            <Button onPress={() => setSignin(false)} mode="text" >{i18n.t("signupAction")}</Button>
          </View>
        </>
        }
        {!isSignin && <>
          <Text style={{ fontSize: 24 }}>{i18n.t("signup")}</Text>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <TextInput
              label={i18n.t("email")}
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
              label={i18n.t("password")}
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
              label={i18n.t("confirmPassword")}
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
            <Button disabled={signupLoading} onPress={handleSignup} mode="contained" disabled={isSignupDisabled}>{i18n.t("signupAction")}</Button>
          </View>
          <View style={styles.verticallySpaced}>
            <Button onPress={() => setSignin(true)} mode="text">{i18n.t("loginAction")}</Button>
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
    // justifyContent: "center",
    paddingTop: 48,
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