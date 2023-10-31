import { useState, useRef, useEffect } from 'react'
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
import { SplashScreen } from './screens/SplashScreen';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setSession, refreshToken } from './redux/features/auth'
import { firebase } from './firebase'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchLessons } from './redux/features/lessons';
import { Snackbar } from 'react-native-paper';
import NetworkLogger from 'react-native-network-logger';
import LogRocket from '@logrocket/react-native';
import 'react-native-url-polyfill/auto';
import "./googleAuth.ts"

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTab = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: '#1CA6AE',
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

const Root = () => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState);
  const [session, errorSession] = useAppSelector((state) => [state.auth.session, state.auth.error])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isLogin = !!session

  useEffect(() => {
    setIsLoading(true)

    try {
      const auth = getAuth(firebase);
      console.log("============ Init onAuthStateChanged ============")
      auth.onAuthStateChanged((user) => {
        console.log({ user })
        if (user) {
          dispatch(setSession({
            accessToken: user.accessToken,
            uid: user.uid,
          }))
          dispatch(fetchLessons())
        } else {
          dispatch(setSession(null))
        }
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }

  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        dispatch(refreshToken())
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{error}</Text>
      </View>
    )
  }


  if (isLoading) {
    return <SplashScreen />
  }

  console.log({ isLogin })
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

export default function App() {

  useEffect(() => {
    LogRocket.init('pacifica-tech/orca-l3pnt');
  }, [])

  return (
    <PaperProvider theme={theme}>
      <Provider store={store}>
        <View style={styles.container}>
          <NavigationContainer>
            <Root />
          </NavigationContainer>
        </View>
      </Provider>
    </PaperProvider >
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  }
});
