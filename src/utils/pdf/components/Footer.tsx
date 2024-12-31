import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    fontSize: 10,
    textAlign: 'center',
  },
});

export const Footer: React.FC = () => (
  <View style={styles.footer} fixed>
    <Text>Endereço: Rua Brigadeiro Tobias, 527 – Centro – São Paulo/SP – CEP 01032-001</Text>
    <Text>Telefone: (11) 3311-3980   |   Email: dhpp.dh@policiacivil.sp.gov.br</Text>
  </View>
);