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
import { supabase } from './supabase';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setSession } from './redux/features/auth'
import { SessionContextProvider } from '@supabase/auth-helpers-react'

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log({
        session
      })
      dispatch(setSession(session))
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
    })
  }, [])

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
  return (
    <PaperProvider theme={theme}>
      <SessionContextProvider supabaseClient={supabase}>
        <Provider store={store}>
          <View style={styles.container}>
            <NavigationContainer>
              <Root />
            </NavigationContainer>
          </View>
        </Provider>
      </SessionContextProvider>
    </PaperProvider >
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  }
});
