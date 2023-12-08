import { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "./Text";
import { Button, TextInput, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons';
import { searchMaterials } from "../redux/features/materials";
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { CardArticle } from "./CardArticle";

export function SearchMaterials({ onSearch, onPressStart, onClose }: { onPressStart: () => void, onSearch: () => void, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const dispatch = useAppDispatch();
  const searchResult = useAppSelector((state) => state.material.searchResult);

  const handleSearchMaterials = async () => {
    setLoading(true);
    setError(false);
    if (!query || query.length < 3) return
    dispatch(searchMaterials({ query }))
    setLoading(false);
    setTag("")
  };

  const handleSetTag = (tag: string) => {
    setTag(tag)
    dispatch(searchMaterials({ tag }))
  }

  return (
    <View style={styles.container}>
      <View style={{ width: "90%", marginBottom: 8, flexDirection: "row" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <TextInput
          // label={i18n.t("password")}
          mode="flat"
          onChangeText={(text) => setQuery(text)}
          // value={password}
          placeholder="Search"
          autoCapitalize={'none'}
          style={{
            flex: 9,
            width: "100%",
            borderBottomColor: "#000",
            borderBottomWidth: 0,
            borderRadius: 28,
          }}
          contentStyle={{
            borderWidth: 0,
            backgroundColor: "#f6f6f6",
            borderRadius: 8,
          }}
          underlineStyle={{
            borderWidth: 0,
          }}
        />
        <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity onPress={handleSearchMaterials}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

      </View>

      <ScrollView style={styles.tagContainer} horizontal showsVerticalScrollIndicator>
        <View style={{ marginHorizontal: 2 }}>
          <Chip style={{ backgroundColor: tag === "japan" ? "#FFD744" : "#f6f6f6" }} onPress={() => handleSetTag("japan")}>#Japan</Chip>
        </View>
        <View style={{ marginHorizontal: 2 }}>
          <Chip style={{ backgroundColor: tag === "startup" ? "#FFD744" : "#f6f6f6" }} onPress={() => handleSetTag("startup")}>#Startup</Chip>
        </View>
        <View style={{ marginHorizontal: 2 }}>
          <Chip style={{ backgroundColor: tag === "stock" ? "#FFD744" : "#f6f6f6" }} onPress={() => handleSetTag("stock")}>#Stock Market</Chip>
        </View>
        <View style={{ marginHorizontal: 2 }}>
          <Chip style={{ backgroundColor: tag === "sdgs" ? "#FFD744" : "#f6f6f6" }} onPress={() => handleSetTag("sdgs")}>#SDGs</Chip>
        </View>
        <View style={{ marginHorizontal: 2 }}>
          <Chip style={{ backgroundColor: tag === "japan" ? "#FFD744" : "#f6f6f6" }} onPress={() => handleSetTag("japan")}>#Healthcare</Chip>
        </View>
      </ScrollView >
      <ScrollView style={styles.searchResult}>
        {
          searchResult.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <CardArticle
                item={item}
                onPressStart={() => onPressStart({ url: item.url, lessonId: item.lessonId, materialId: item.id, lessonId: item.lessonId })}
                lessonId={item.lessonId}
              />
            </View>
          ))
        }
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: '#fff',
    alignItems: "center",
  },
  tagContainer: {
    width: "90%",
    marginBottom: 8,
    height: 32
  },
  buttonContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    justifyContent: "center",
    width: "100%",
  },
  searchResult: {
    width: "100%",
  },
  cardWrapper: {
    marginVertical: 2,
    marginBottom: 8,
  }
})
