import React from 'react';
import { View, Image, Text, StyleSheet } from '@react-pdf/renderer';
import { Photo } from '../../../types';

const styles = StyleSheet.create({
  photoContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  photoWrapper: {
    width: '72%',
    height: 300,
    marginBottom: 2,
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 0,
    width: '85%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

interface PhotoItemProps {
  photo: Photo;
}

export const PhotoItem: React.FC<PhotoItemProps> = ({ photo }) => (
  <View style={styles.photoContainer}>
    <View style={styles.photoWrapper}>
      <Image 
        style={styles.photo} 
        src={photo.photo}
        cache={false}
      />
    </View>
    <Text style={styles.description}>
      {photo.description || 'Sem descrição'}
    </Text>
  </View>
);