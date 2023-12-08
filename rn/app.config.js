const dotenv = require("dotenv");
const { expand } = require("dotenv-expand");
const path = require("path");

console.log("🦊🦊🦊 Loading env vars for stage:", process.env.STAGE)
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
export default () => ({
  "expo": {
    "name": "Orca - RSS x AI English",
    "slug": "orca",
    "owner": "keioka",
    "version": "0.7.4",
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
        "projectId": "4aebf76e-02f3-4591-a848-7725ed175c51"
      }
    },
    "plugins": [
      "sentry-expo"
    ],
    "runtimeVersion": "0.0.1",
    "android": {
      "package": "com.taiheyyo.orca"
    },
    "ios": {
      "bundleIdentifier": "com.taiheyyo.orca"
    },
    "updates": {
      "url": "https://u.expo.dev/4aebf76e-02f3-4591-a848-7725ed175c51"
    }
  },
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.taiheyyo.orca",
    "versionCode": 1,
    "infoPlist": {
      "NSPhotoLibraryUsageDescription": "This app uses the photo library to save photos for your profile.",
      "NSSpeechRecognitionUsageDescription": "This app uses speech recognition to transcribe your voice to text.",
      "NSMicrophoneUsageDescription": "This app uses the microphone to record your voice.",
    }
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "versionCode": 1,
    "package": "com.taiheyyo.orca"
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
})