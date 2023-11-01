import React from 'react';
import { Card, Title, Text } from 'react-native-paper';
import { StyleSheet, View, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Material {
  category: string;
  categoryExternal: string;
  createdAt: string;
  id: string;
  imageUrl: string;
  publishedAt: string;
  publisherId: string;
  title: string;
  type: string;
  updatedAt: string;
  url: string;
}

interface PreviewMaterialProps {
  material: Material;
}

const PreviewMaterial: React.FC<PreviewMaterialProps> = ({ material }) => {
  const { title, imageUrl, publishedAt, url } = material;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card style={styles.card} onPress={() => console.log(`Navigating to ${url}`)}>
      <View style={styles.row}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color="#b4b4b4" />
          </View>
        )}
        <View style={styles.content}>
          <View>
            <Title style={{ fontSize: 14, lineHeight: 14 }}>{title}</Title>
          </View>
          <View style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 12, lineHeight: 12 }}>Published on: {formatDate(publishedAt)}</Text>

          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    elevation: 0,
    backgroundColor: '#fff',
    boxShadow: '0 0 0 0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
});

export default PreviewMaterial;
