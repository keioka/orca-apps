import { useState, useRef, useEffect, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { CardArticle } from './components/CardArticle';
import { FeedScreen } from './screens/FeedScreen';
import { LessonScreen } from './screens/LessonScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { TalkScreen } from './screens/TalkScreen';
import { NoteScreen } from './screens/NoteScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthScreen } from './screens/AuthScreen';
import { CategoryScreen } from './screens/CategoryScreen';
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
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        tabBarLabel: 'History',
        headerStyle: {
          shadowColor: 'transparent',
        }
      }}

    />
    <Tab.Screen
      name="Note"
      component={NoteScreen}
      options={{
        tabBarLabel: 'Note',
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
      component={FeedScreen}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Lesson"
      component={LessonScreen}
      options={{
        tabBarLabel: 'Lesson',
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
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isLogin = !!session

  const [fontsLoaded] = useFonts(fonts);

  useEffect(() => {
    setIsLoading(true)
    const hasPastedOneHour = moment().diff(moment(session?.lastUpdatedAt), 'hours') > 1

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
        } else {
          dispatch(setSession(null))
          dispatch(resetStateAction)
        }
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    } finally {
      setIsLoading(false)
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
      if (!isLoading && fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    hide()
  }, [isLoading, fontsLoaded])

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

Sentry.init({
  dsn: "https://e25048ab84e9c5d338110cc22f6fb409@o4506180296966144.ingest.sentry.io/4506180298735616",
  enableInExpoDevelopment: true,
});

function App() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      onFetchUpdateAsync()
      LogRocket.init('taiheyyo/orca-prod');
    }
  }, [])

  return (
    <Sentry.React.ErrorBoundary fallback={ErrorScreen}>
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
