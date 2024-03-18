import { useState, useRef, useEffect, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { CardArticle } from './components/CardArticle';
import { FeedScreen } from './screens/FeedScreen';
import { OriginalFeedScreen } from './screens/OriginalFeedScreen';
import { LessonScreen } from './screens/LessonScreen';
import { LessonOriginalScreen } from './screens/LessonOriginalScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { TalkScreen } from './screens/TalkScreen';
import { NoteScreen } from './screens/NoteScreen';
import { HashtagScreen } from './screens/HashtagScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthScreen } from './screens/AuthScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { SelectLanguageScreen } from './screens/SelectLanguageScreen';
// import { SplashScreen } from './screens/SplashScreen';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setSession, refreshToken } from './redux/features/auth'
import { firebase } from './firebase'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Snackbar } from 'react-native-paper';
import NetworkLogger from 'react-native-network-logger';
import LogRocket from '@logrocket/react-native';
import 'react-native-url-polyfill/auto';
// import "./googleAuth.ts"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from 'react-native-error-boundary'
import { ErrorScreen } from './screens/ErrorScreen';
import * as Sentry from 'sentry-expo';
import * as Updates from 'expo-updates';
import moment from 'moment';
import { analytics } from './helpers/mixpanel';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import { i18n } from './locales';
import { fetchCurrentUser, setMpTrackingId } from './redux/features/auth';
import { Audio } from "expo-av";
import { WebView } from 'react-native-webview';
import { fetchFeatureFlag } from './redux/features/featureFlag';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTab = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: '#2852A4',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused
            ? 'ios-home'
            : 'ios-home-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'ios-list' : 'ios-list-outline';
        } else if (route.name === 'Note') {
          iconName = focused ? 'ios-document' : 'ios-document-outline';
        } else if (route.name === 'Feedback') {
          iconName = focused ? 'ios-chatbubble' : 'ios-chatbubble-outline';
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarLabel: i18n.t('home'),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Feed"
      component={FeedStack}
      options={{
        tabBarLabel: i18n.t('home'),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        tabBarLabel: i18n.t('history'),
        headerStyle: {
          shadowColor: 'transparent',
        }
      }}

    />
    <Tab.Screen
      name="Note"
      component={NoteScreen}
      options={{
        tabBarLabel: i18n.t('note'),
        headerStyle: {
          shadowColor: 'transparent',
        }
      }}
    />
    <Tab.Screen
      name="Feedback"
      component={() => {
        return (
          <WebView
            source={{ uri: "https://forms.gle/3pD3nbPf77CfwCDB7" }}
          />
        )
      }}
      options={{
        tabBarLabel: i18n.t('feedback'),
        headerStyle: {
          shadowColor: 'transparent',
        }
      }}
    />
    {
      process.env.NODE_ENV === 'development' &&
      <Tab.Screen
        name="NetworkLogger"
        component={NetworkLogger}
        options={{
          tabBarLabel: 'NetworkLogger',
          headerStyle: {
            shadowColor: 'transparent',
          }
        }}
      />
    }

    {/* <Tab.Screen name="Settings" component={SettingsScreen} /> */}
  </Tab.Navigator>
)

const HomeStack = () => (
  <Stack.Navigator>
    <Tab.Screen
      name="Feed"
      component={OriginalFeedScreen}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="LessonOriginal"
      component={LessonOriginalScreen}
      options={{
        tabBarLabel: 'dd',
      }}
    />
    <Tab.Screen
      name="Talk"
      component={TalkScreen}
      options={{
        tabBarLabel: 'Talk',
      }}
    />

  </Stack.Navigator>
)

const FeedStack = () => (
  <Stack.Navigator>
    <Tab.Screen
      name="Feed"
      component={FeedScreen}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Lesson"
      component={LessonScreen}
      options={{
        tabBarLabel: 'dd',
      }}
    />
    <Tab.Screen
      name="Talk"
      component={TalkScreen}
      options={{
        tabBarLabel: 'Talk',
      }}
    />

  </Stack.Navigator>
)

const RootStack = ({ isLogin }) => (
  <Stack.Navigator>
    {isLogin ?
      <>
        <Stack.Screen
          name="Main"
          component={MainTab}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="SelectLanguageScreen"
          component={SelectLanguageScreen}
          options={{
            headerShown: false,
          }}
        />
      </> :
      <>
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            headerShown: false,
          }}
        />
      </>
    }
  </Stack.Navigator>
)

const fonts = {
  'NotoSans-Black': require('./assets/fonts/NotoSans/NotoSans-Black.ttf'),
  'NotoSans-BlackItalic': require('./assets/fonts/NotoSans/NotoSans-BlackItalic.ttf'),
  'NotoSans-Bold': require('./assets/fonts/NotoSans/NotoSans-Bold.ttf'),
  'NotoSans-BoldItalic': require('./assets/fonts/NotoSans/NotoSans-BoldItalic.ttf'),
  'NotoSans-ExtraBold': require('./assets/fonts/NotoSans/NotoSans-ExtraBold.ttf'),
  'NotoSans-ExtraBoldItalic': require('./assets/fonts/NotoSans/NotoSans-ExtraBoldItalic.ttf'),
  'NotoSans-ExtraLight': require('./assets/fonts/NotoSans/NotoSans-ExtraLight.ttf'),
  'NotoSans-ExtraLightItalic': require('./assets/fonts/NotoSans/NotoSans-ExtraLightItalic.ttf'),
  'NotoSans-Italic': require('./assets/fonts/NotoSans/NotoSans-Italic.ttf'),
  'NotoSans-Light': require('./assets/fonts/NotoSans/NotoSans-Light.ttf'),
  'NotoSans-LightItalic': require('./assets/fonts/NotoSans/NotoSans-LightItalic.ttf'),
  'NotoSans-Medium': require('./assets/fonts/NotoSans/NotoSans-Medium.ttf'),
  'NotoSans-MediumItalic': require('./assets/fonts/NotoSans/NotoSans-MediumItalic.ttf'),
  'NotoSans-Regular': require('./assets/fonts/NotoSans/NotoSans-Regular.ttf'),
  'NotoSans-SemiBold': require('./assets/fonts/NotoSans/NotoSans-SemiBold.ttf'),
  'NotoSans-SemiBoldItalic': require('./assets/fonts/NotoSans/NotoSans-SemiBoldItalic.ttf'),
  'NotoSans-Thin': require('./assets/fonts/NotoSans/NotoSans-Thin.ttf'),
  'NotoSans-ThinItalic': require('./assets/fonts/NotoSans/NotoSans-ThinItalic.ttf'),
}

const resetStateAction = {
  type: "global/RESET_STATE",
  payload: null,
}

async function onFetchUpdateAsync() {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error(error)
    // You can also add an alert() to see the error message in case of an error when fetching updates.
  }
}

const Root = () => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState);
  const tokenRefreshInterval = useRef<Timer>(null)
  const [session, errorSession] = useAppSelector((state) => [state.auth.session, state.auth.error])
  const currentUser = useAppSelector((state) => state.auth.currentUser)
  const isFetchingCurrentUser = useAppSelector((state) => state.auth.isFetchingCurrentUser)

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInit, setIsInit] = useState(false)
  const isLogin = !!session && !!currentUser

  const [fontsLoaded] = useFonts(fonts);

  useEffect(() => {
    setIsLoading(true)
    const hasPastedOneHour = moment().diff(moment(session?.lastUpdatedAt), 'hours') > 1
    dispatch(fetchFeatureFlag())

    try {
      const auth = getAuth(firebase);
      console.log("============ Init onAuthStateChanged ============")
      auth.onAuthStateChanged(async (user) => {
        console.log(">>>>>>>>> User <<<<<<<", user)
        if (user) {
          let accessToken = user.accessToken
          if (session?.lastUpdatedAt && hasPastedOneHour) {
            console.warn("hasPastedOneHour", { hasPastedOneHour })
            accessToken = await auth.currentUser?.getIdToken()
          }
          dispatch(setSession({
            accessToken: accessToken,
            uid: user.uid,
          }))
          dispatch(fetchCurrentUser({
            accessToken: accessToken,
          }))

        } else {
          dispatch(setSession(null))
          dispatch(resetStateAction)
        }
        setIsLoading(false)
        setIsInit(true)
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }

    const mins30 = 1800000

    const refreshInterval = setInterval(() => {
      dispatch(refreshToken())
    }, mins30)

    tokenRefreshInterval.current = refreshInterval

    return () => {
      clearInterval(tokenRefreshInterval.current)
    }
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        dispatch(refreshToken())
        onFetchUpdateAsync()
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function hide() {
      if (!isLoading && isInit && !isFetchingCurrentUser && fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hide()
  }, [isLoading, isFetchingCurrentUser, isInit, fontsLoaded])

  useEffect(() => {
    setMpTrackingIdToUser()
  }, [currentUser])

  async function setMpTrackingIdToUser() {
    const deviceId = await fetchDeviceId()
    if (typeof deviceId !== 'string') {
      console.error("deviceId is not string", deviceId)
      return
    }

    if (currentUser && (!currentUser.mpTrackingId || currentUser.mpTrackingId !== deviceId)) {
      dispatch(setMpTrackingId({ mpTrackingId: deviceId }))
    }
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{error}</Text>
      </View>
    )
  }

  return (
    <RootStack isLogin={isLogin} />
  )
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    accent: '#f1c40f',
  },

};


async function fetchDeviceId() {
  const DEVICE_ID_KEY = 'secure_deviceid';
  let fetchUUID = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (fetchUUID) {
    return fetchUUID;
  }
  let uuidV4 = uuid.v4();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, uuidV4 as string);
  return uuid;
}

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      onFetchUpdateAsync()
      LogRocket.init(process.env.EXPO_PUBLIC_LOGROCKET);
      setDeviceId()
      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        enableInExpoDevelopment: true,
      });
    }

    async function setDeviceId() {
      try {
        const deviceId = await fetchDeviceId()
        console.log("setDeviceId: deviceId", deviceId)
        analytics.identify(deviceId)
      } catch (error) {
        console.error(error)
        throw error
      }
    }

    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

  }, [])

  function handleError(error: Error, componentStack: string) {
    console.error(error, componentStack)
    LogRocket.captureException(error)
  }

  return (
    <Sentry.React.ErrorBoundary fallback={ErrorScreen} onError={handleError}>
      <PaperProvider theme={theme}>
        <Provider store={store}>
          <View style={styles.container}>
            <NavigationContainer>
              <Root />
            </NavigationContainer>
          </View>
        </Provider>
      </PaperProvider >
    </Sentry.React.ErrorBoundary>
  );
}

export default Sentry.Native.wrap(App);


const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  }
});
