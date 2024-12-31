import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { Photo } from '../../../types';
import { PhotoItem } from './PhotoItem';

const styles = StyleSheet.create({
  container: {
    marginTop: 10, // Reduced margin to bring photos closer to title
  },
});

interface PhotoListProps {
  photos: Photo[];
}

export const PhotoList: React.FC<PhotoListProps> = ({ photos }) => {
  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

  return (
    <View style={styles.container}>
      {sortedPhotos.map((photo) => (
        <PhotoItem key={photo.id} photo={photo} />
      ))}
    </View>
  );
};