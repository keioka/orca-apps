import { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import SelectDropdown from 'react-native-select-dropdown'
import { Text } from "./Text";
import { FontAwesome5 } from '@expo/vector-icons';
import { i18n } from "../locales";
import moment from "moment";


enum StastsTab {
  lessons = 'lessons',
  vocabulary = 'vocabulary',
  paraphrase = 'paraphrase',
  wordCount = 'wordCount',
}

function convertTabToKey(tab: StastsTab) {
  switch (tab) {
    case StastsTab.lessons:
      return "lessonsByDay"
    case StastsTab.vocabulary:
      return "vocabulariesByDay"
    case StastsTab.paraphrase:
      return "paraphrasesByDay"
    case StastsTab.wordCount:
      return "wordCountByDay"
  }
}

const goals: { [key: StastsTab]: number } = {
  lessons: 3,
  vocabulary: 20,
  paraphrase: 10,
  wordCount: 30,
}

const addMissingDates = (data, type: StastsTab) => {
  if (!data || data.length === 0) {
    return []
  }
  const dataCopy = [...data]
  const sortedData = dataCopy.sort((a, b) => new Date(a.date) - new Date(b.date));
  const startDate = moment(new Date(sortedData[0].date));
  const endDate = moment(); // Set the end date to today
  const result = [];

  // Convert data array to a map for faster lookup
  const dataMap = new Map(dataCopy.map(item => [moment(item.date).format('YYYY-MM-DD'), item]));

  for (let date = moment(startDate); date.isSameOrBefore(endDate); date = date.add(1, 'days')) {
    const dateString = date.format('YYYY-MM-DD');
    const found = dataMap.get(dateString);
    const goal = goals[type];
    if (found) {
      result.push({
        ...found,
        label: moment(found.date).format('MM/DD'),
        frontColor: found.value > goal ? '#2FABE8' : null,
        topLabelComponent: () =>
          found.value > goal ? (
            <View style={{ alignItems: "center" }}>
              <FontAwesome5 name="award" size={18} color="#FFD744" />
              <Text>{found.value}</Text>
            </View>
          ) : <Text>{found.value}</Text>
      });
    } else {
      if (!date.isSame(endDate, 'day')) {
        result.push({
          date: dateString,
          label: date.format('MM/DD'),
          value: 0 // Default value for missing dates
        });
      }
    }
  }

  return result;
};

export function UserStats({ stats }) {
  const [tab, setTab] = useState(StastsTab.lessons)

  const dataToDisplay = useMemo(() => {
    const key = convertTabToKey(tab)
    return addMissingDates(stats[key], tab)
  }, [stats, tab])

  return (
    <View style={{ padding: 24 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setTab(StastsTab.lessons)}>
          <View style={[styles.button, tab === StastsTab.lessons ? styles.menuButtonActive : null]}>
            <Text style={[styles.textMenu, tab === StastsTab.lessons ? styles.textMenuActive : null]} weight='SemiBold'>{i18n.t("numberOfLesson")}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab(StastsTab.wordCount)}>
          <View style={[styles.button, tab === StastsTab.wordCount ? styles.menuButtonActive : null]}>
            <Text style={[styles.textMenu, tab === StastsTab.wordCount ? styles.textMenuActive : null]} weight='SemiBold'>{i18n.t("numberOfWordSpoken")}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTab(StastsTab.vocabulary)}>
          <View style={[styles.button, tab === StastsTab.vocabulary ? styles.menuButtonActive : null]}>
            <Text style={[styles.textMenu, tab === StastsTab.vocabulary ? styles.textMenuActive : null]} weight='SemiBold'>{i18n.t("numberOfSavedVocabulary")}</Text>
          </View>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => setTab(StastsTab.paraphrase)}>
          <View style={[styles.button, tab === StastsTab.paraphrase ? styles.menuButtonActive : null]}>
            <Text style={[styles.textMenu, tab === StastsTab.paraphrase ? styles.textMenuActive : null]} weight='SemiBold'>{i18n.t("numberOfSavedParaphrase")}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      {dataToDisplay.length === 0 ? (
        <View style={{ width: "100%", height: 240, marginTop: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f4", borderRadius: 8 }}>
          <Text>{i18n.t("noData")}</Text>
        </View>
      ) :
        <BarChart
          barWidth={22}
          noOfSections={5}
          barBorderRadius={4}
          frontColor="lightgray"
          data={dataToDisplay}
          yAxisThickness={0}
          xAxisThickness={0}
        />
      }
      {/* <View style={{ flexDirection: "row", width: "100%" }}>
        <SelectDropdown
          data={displayType}
          onSelect={(selectedItem, index) => {
            console.log(selectedItem, index)
          }}
          renderCustomizedRowChild={(item, index) => {
            return (
              <Text>{item.label}</Text>
            );
          }}
          defaultButtonText={'Select city'}
          dropdownIconPosition={'right'}
          renderDropdownIcon={isOpened => {
            return <5 name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={18} />;
          }}
        />
        <SelectDropdown
          data={range}
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
      </View> */}
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  cardWrapper: {
    marginBottom: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    width: '100%',
    paddingTop: 28,
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: "5%",
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
    overflow: 'scroll'
  },
  button: {
    minWidth: 110,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonActive: {
    backgroundColor: "#242424",
    borderRadius: 32,
    padding: 12,
  },
  textMenu: {
    textAlign: 'center',
  },
  textMenuActive: {
    color: "#fff"
  }
});
