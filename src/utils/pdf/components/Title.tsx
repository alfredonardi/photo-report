import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginTop: -8, // Increased margin to move title down
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
});

export const Title: React.FC = () => (
  <Text style={styles.title}>Relatório Fotográfico</Text>
);