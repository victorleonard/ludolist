import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { GameCard, Game } from '@/components/games';

// Données statiques pour tester l'UI
const mockGames: Game[] = [
  {
    id: 1,
    titre: 'Catan',
    image: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__imagepage/img/M_3Vg1j2HlNgkv7PL3T0pSJiNpk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2419375.jpg',
    age_min: 10,
    age_max: null,
    tags: ['3-4 joueurs', 'Stratégie', '60-90 min'],
    rating: 4.5,
    topWinner: { username: 'Alice', wins: 5 }
  },
  {
    id: 2,
    titre: 'Ticket to Ride',
    image: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__imagepage/img/6-MVEJZzEiqFz4W3hc697UIOejA=/fit-in/900x600/filters:no_upscale():strip_icc()/pic66668.jpg',
    age_min: 8,
    age_max: 12,
    tags: ['2-5 joueurs', 'Famille', '30-60 min'],
    rating: 4,
    topWinner: { username: 'Bob', wins: 3 }
  },
  {
    id: 3,
    titre: '7 Wonders',
    image: 'https://cf.geekdo-images.com/35h9Za_JvMMMtx_92kT0Jg__imagepage/img/ilf9tAog95gDOme3zeSt6FOV92E=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7149798.jpg',
    age_min: 10,
    age_max: null,
    tags: ['2-7 joueurs', 'Cartes', '30-45 min'],
    rating: 5,
    topWinner: { username: 'Charlie', wins: 8 }
  },
  {
    id: 4,
    titre: 'Azul',
    image: 'https://cf.geekdo-images.com/aPSHJO0d0XOpQR5X-wJonw__imagepage/img/q4uWd2nXGeEkKDR9P_F28UU-Bo8=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6973671.png',
    age_min: 8,
    age_max: null,
    tags: ['2-4 joueurs', 'Abstrait', '30-45 min'],
    rating: 4.5,
    topWinner: null
  },
];

export default function GamesScreen() {
  const handleGamePress = (game: Game) => {
    console.log('Jeu sélectionné:', game.titre);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Titre */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Ma collection de jeux</Text>
          </View>

          {/* Liste des jeux */}
          <View>
            {mockGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game}
                onPress={handleGamePress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
});
