import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import SelectDropdown from 'react-native-select-dropdown'
import { Text } from '../components/Text'
import { Button } from 'react-native-paper'

export function SelectLanguageScreen() {
  const countries = ["Egypt", "Canada", "Australia", "Ireland"]
  const handleSubmit = () => { }
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24 }}>Select your language</Text>
        </View>
        <SelectDropdown
          data={countries}
          onSelect={(selectedItem, index) => {
            console.log(selectedItem, index)
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            // text represented after item is selected
            // if data array is an array of objects then return selectedItem.property to render after item is selected
            return selectedItem
          }}
          rowTextForSelection={(item, index) => {
            // text represented for each item in dropdown
            // if data array is an array of objects then return item.property to represent item in dropdown
            return item
          }}
        />
      </View>
      <Button
        onPress={handleSubmit}
        textColor="#fff"
        mode="contained"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        style={{
          width: "100%",
          backgroundColor: "#2FABE8",
          borderRadius: 0,
          height: 64,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Complete
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginTop: 40,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  }
})