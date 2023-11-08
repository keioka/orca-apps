const dotenv = require("dotenv");
const { expand } = require("dotenv-expand");
const path = require("path");

// HACK: Custom env var loading logic to support `.env.prod`
if (process.env.STAGE) {
  const pathToEnv = path.join(
    __dirname,
    ["./.env", process.env.STAGE].filter(Boolean).join(".")
  )
  expand(
    dotenv.config({
      path: pathToEnv,
      override: true,
    })
  );
}

// https://github.com/expo/expo/issues/23727
module.exports = {
  "expo": {
    "name": "orca - AI English tutor",
    "slug": "orcatalk",
    "version": "0.7.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "extra": {
      "eas": {
        "projectId": "8b85890b-bb8f-41ab-b32a-df79d5291cb8"
      },
      EXPO_PUBLIC_API_ROOT: process.env.API_ROOT,
      EXPO_PUBLIC_FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      EXPO_PUBLIC_LAST_UPDATE_TIME: new Date().toISOString(),
    },
    "plugins": [
      "sentry-expo"
    ],
    "runtimeVersion": "1.0.1",
    "updates": {
      "url": "https://u.expo.dev/8b85890b-bb8f-41ab-b32a-df79d5291cb8"
    }
  },
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.koka0828us.orcatalk",
    "infoPlist": {
      "NSPhotoLibraryUsageDescription": "This app uses the photo library to save photos for your profile."
    }
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "package": "com.koka0828us.orcatalk"
  },
  "web": {
    "favicon": "./assets/favicon.png"
  },
  "hooks": {
    "postPublish": [
      {
        "file": "sentry-expo/upload-sourcemaps",
        "config": {
          "organization": "taiheyyo-inc",
          "project": "orca-prod"
        }
      }
    ]
  },
  "plugins": [
    "@logrocket/react-native",
    "sentry-expo",
    [
      "@react-native-voice/voice",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
        "speechRecognitionPermission": "CUSTOM: Allow $(PRODUCT_NAME) to securely recognize user speech"
      }
    ],
    [
      "expo-av",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
      }
    ]
  ]
}