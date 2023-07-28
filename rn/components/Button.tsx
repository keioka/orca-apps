import { TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { Button as ButtonPaper } from 'react-native-paper'

export const Button = ({
  onPress,
  children,
  isGradient,
  bgColor
}: {
  onPress: () => void,
  children: React.ReactNode,
  isGradient?: boolean
  bgColor?: string
}) => {
  return (
    <>
      {isGradient ?
        <TouchableOpacity onPress={onPress}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#4CB8C4', '#4CB8C4', '#3CD3AD',]}
            style={styles.button}>
            <Text style={{ color: "#fff" }}>{children}</Text>
          </LinearGradient>
        </TouchableOpacity> :
        <ButtonPaper
          onPress={onPress}
          textColor='#fff'
          style={[
            styles.regButton,
            {
              backgroundColor: bgColor ? bgColor : "black",
            }
          ]}
        >
          {children}
        </ButtonPaper>
      }
    </>

  )
}

const buttonCore = {
  color: "#fff",
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 32,
}

const styles = StyleSheet.create({
  button: {
    ...buttonCore,
    width: "100%",
    height: 48,
    borderRadius: 48,
    backgroundColor: '#9FD1D5',
    borderWidth: 0,
  },
  regButton: {
    ...buttonCore,
    height: 48,
    borderRadius: 48,
    backgroundColor: 'black',
  }
});
