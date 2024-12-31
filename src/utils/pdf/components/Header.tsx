import React from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    height: 100,
  },
  headerTextContainer: {
    marginTop: 3,
  },
  headerText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginBottom: 10,
  },
  headerTextBold: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  logo: {
    width: 75, // Adjusted to maintain aspect ratio (100 * 0.75)
    height: 100, // Set to requested height
    marginRight: 15,
  },
});

interface HeaderProps {
  boNumber: string;
  version: string;
  selectedGroup: string;
  logo: string;
}

export const Header: React.FC<HeaderProps> = ({ boNumber, version, selectedGroup, logo }) => (
  <View style={styles.header}>
    <Image style={styles.logo} src={logo} />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTextBold}>Secretaria da Segurança Pública</Text>
      <Text style={styles.headerTextBold}>POLÍCIA CIVIL DO ESTADO DE SÃO PAULO</Text>
      <Text style={styles.headerText}>Departamento Estadual de Homicídios e Proteção à Pessoa – DHPP</Text>
      <Text style={styles.headerText}>Divisão de Homicídios "Dr. FRANCISCO DE ASSIS CAMARGO MAGNO"</Text>
      <Text style={styles.headerText}>Grupo Especial de Atendimento a Local de Crime – GEACRIM {selectedGroup}</Text>
      <Text style={styles.headerText}>Boletim de Ocorrência {boNumber} Versão {version}</Text>
    </View>
  </View>
);