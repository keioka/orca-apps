import { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { CardArticle } from './components/CardArticle';
import { FeedScreen } from './screens/FeedScreen';
import { LessonScreen } from './screens/LessonScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { NoteScreen } from './screens/NoteScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthScreen } from './screens/AuthScreen';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setSession } from './redux/features/auth'
import { firebase } from './firebase'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Snackbar } from 'react-native-paper';
import NetworkLogger from 'react-native-network-logger';
import LogRocket from '@logrocket/react-native';

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
      }} />
  </Stack.Navigator>
)

const RootStack = () => (
  <Stack.Navigator initialRouteName="Main">
    <Tab.Screen
      name="Main"
      component={MainTab}
      options={{
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Auth"
      component={AuthScreen}
      options={{
        headerShown: false,
      }}
    />
  </Stack.Navigator>
)

const Root = () => {
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const auth = getAuth(firebase);
      onAuthStateChanged(auth, (user) => {
        if (user) {
          dispatch(setSession({
            accessToken: user.accessToken,
            uid: user.uid,
          }))
        } else {
          dispatch(setSession(null))
        }
      })
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }, [])

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{error}</Text>
      </View>
    )
  }

  return (
    <RootStack />
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
