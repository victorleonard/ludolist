import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Icône */}
        <View style={styles.logoContainer}>
          <Ionicons name="game-controller" size={80} color="#3B82F6" />
        </View>

        {/* Titre */}
        <Text style={styles.title}>Bienvenue sur LudoList</Text>
        
        <Text style={styles.subtitle}>
          Gérez votre collection de jeux de société et suivez vos parties
        </Text>

        {/* Cartes d'action */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/games')}
            activeOpacity={0.7}
          >
            <Ionicons name="dice" size={40} color="#3B82F6" style={{ marginBottom: 12 }} />
            <Text style={styles.cardTitle}>Mes Jeux</Text>
            <Text style={styles.cardSubtitle}>Explorez votre collection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => console.log('Sessions à venir')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={40} color="#8B5CF6" style={{ marginBottom: 12 }} />
            <Text style={styles.cardTitle}>Parties</Text>
            <Text style={styles.cardSubtitle}>Historique des parties</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push('/games')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Voir ma collection</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    maxWidth: 300,
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
