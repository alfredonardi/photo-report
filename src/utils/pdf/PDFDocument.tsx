import React from 'react';
import { Document, Page, View, StyleSheet } from '@react-pdf/renderer';
import { Photo } from '../../types';
import { Header } from './components/Header';
import { Title } from './components/Title';
import { PhotoItem } from './components/PhotoItem';
import { Footer } from './components/Footer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  pageContent: {
    flex: 1,
  }
});

interface PDFDocumentProps {
  boNumber: string;
  version: string;
  selectedGroup: string;
  photos: Photo[];
  logo: string;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  boNumber,
  version,
  selectedGroup,
  photos,
  logo
}) => {
  // Ordena as fotos por posição
  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);
  
  // Divide as fotos em grupos de 2 para cada página
  const photoGroups = sortedPhotos.reduce<Photo[][]>((acc, photo, index) => {
    const groupIndex = Math.floor(index / 2);
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }
    acc[groupIndex].push(photo);
    return acc;
  }, []);

  return (
    <Document>
      {photoGroups.map((groupPhotos, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Header
            boNumber={boNumber}
            version={version}
            selectedGroup={selectedGroup}
            logo={logo}
          />
          {pageIndex === 0 && <Title />}
          <View style={styles.pageContent}>
            {groupPhotos.map(photo => (
              <PhotoItem key={photo.id} photo={photo} />
            ))}
          </View>
          <Footer />
        </Page>
      ))}
    </Document>
  );
};
