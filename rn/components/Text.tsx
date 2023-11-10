import { Text as TextCore, TextProps as TextCoreProps, Title as TitleCore } from "react-native-paper";
import { StyleSheet, TextStyle } from "react-native";

// Define a new interface that extends TextCoreProps and includes the new props
interface TextProps extends TextCoreProps {
  weight?: 'Black' | 'Bold' | 'ExtraBold' | 'ExtraLight' | 'Light' | 'Medium' | 'Regular' | 'SemiBold' | 'Thin';
  italic?: boolean;
  style?: TextStyle;
}

export function Text({ style, weight = 'Medium', italic = false, ...props }: TextProps) {
  // Determine the font family based on weight and italic props
  let fontFamily = `NotoSans-${weight}`;
  if (italic) {
    fontFamily += 'Italic';
  }

  return (
    <TextCore {...props} style={[styles.font, { fontFamily }, style]}>
      {props.children}
    </TextCore>
  );
}


export function Title({ style, weight = 'SemiBold', italic = false, ...props }: TextProps) {
  // Determine the font family based on weight and italic props
  let fontFamily = `NotoSans-${weight}`;
  if (italic) {
    fontFamily += 'Italic';
  }

  return (
    <TitleCore {...props} style={[styles.font, { fontFamily }, style]}>
      {props.children}
    </TitleCore>
  );
}


const styles = StyleSheet.create({
  font: {
    // color: '#36454F',
    color: "#0D160B"
    // You can set default styles for your text here
  },
});