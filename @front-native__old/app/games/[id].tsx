import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/stores/familyStore';
import AppHeader from '@/components/AppHeader';
import { InteractiveStarRating } from '@/components/games/InteractiveStarRating';
import { Badge } from '@/components/games/Badge';
import { GameSessions } from '@/components/games/GameSessions';
import { Ionicons } from '@expo/vector-icons';

interface Rating {
  id: number;
  rating: number;
  member: {
    id: number;
  };
}

interface WinnerData {
  member: {
    id: number;
    username: string;
  };
  wins: number;
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-yellow-100', text: 'text-yellow-600' },
];

const getMemberAvatarColor = (memberId: number) => {
  return AVATAR_COLORS[memberId % AVATAR_COLORS.length];
};

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const gameId = parseInt(id || '0', 10);

  const [activeTab, setActiveTab] = useState<'detail' | 'notes' | 'parties' | 'podium'>('detail');
  const [loading, setLoading] = useState(true);
  const [top3Winners, setTop3Winners] = useState<WinnerData[]>([]);

  const familyStore = useFamilyStore();
  const games = familyStore.getTransformedGames();
  const members = familyStore.getFamilyMembers();
  const game = games.find((g) => g.id === gameId);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    setLoading(true);
    await familyStore.fetchFamily();
    await loadTop3Winners();
    setLoading(false);
  };

  const loadTop3Winners = async () => {
    const result = await familyStore.getTop3Winners(gameId);
    if (result.success && result.data) {
      setTop3Winners(result.data);
    }
  };

  const getMemberRating = (memberId: number): number => {
    if (!game?.ratings) return 0;
    const memberRating = game.ratings.find((r: Rating) => r.member.id === memberId);
    return memberRating ? memberRating.rating : 0;
  };

  const setMemberRating = async (memberId: number, rating: number) => {
    const result = await familyStore.setRating(gameId, memberId, rating);
    if (!result.success) {
      Alert.alert('Erreur', result.error || 'Erreur lors de l\'enregistrement de la note');
    }
  };

  const deleteMemberRating = async (memberId: number) => {
    Alert.alert(
      'Supprimer la note',
      'Voulez-vous vraiment supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setMemberRating(memberId, 0),
        },
      ]
    );
  };

  const calculateAverageRating = (): number => {
    if (!game?.ratings || game.ratings.length === 0) return 0;
    const ratings = game.ratings.filter((r: Rating) => r.rating > 0);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0);
    return sum / ratings.length;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100">
        <AppHeader title="Détail du jeu" showBackButton={true} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (!game) {
    return (
      <View className="flex-1 bg-gray-100">
        <AppHeader title="Détail du jeu" showBackButton={true} />
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-bold text-gray-700 mt-4">Jeu non trouvé</Text>
          <Text className="text-gray-500 mt-2 text-center">
            Le jeu que vous recherchez n'existe pas ou n'est plus disponible.
          </Text>
        </View>
      </View>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <View className="flex-1 bg-gray-100">
      <AppHeader title={game.titre} showBackButton={true} />

      {/* Tabs */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab('detail')}
            className={`flex-1 flex-row items-center justify-center py-3 border-b-2 ${
              activeTab === 'detail' ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={activeTab === 'detail' ? '#3B82F6' : '#9CA3AF'}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === 'detail' ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              Détail
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('notes')}
            className={`flex-1 flex-row items-center justify-center py-3 border-b-2 ${
              activeTab === 'notes' ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <Ionicons
              name="star"
              size={20}
              color={activeTab === 'notes' ? '#3B82F6' : '#9CA3AF'}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === 'notes' ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('parties')}
            className={`flex-1 flex-row items-center justify-center py-3 border-b-2 ${
              activeTab === 'parties' ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <Ionicons
              name="game-controller"
              size={20}
              color={activeTab === 'parties' ? '#3B82F6' : '#9CA3AF'}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === 'parties' ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              Parties
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('podium')}
            className={`flex-row items-center justify-center px-4 py-3 border-b-2 ${
              activeTab === 'podium' ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <Ionicons
              name="trophy"
              size={20}
              color={activeTab === 'podium' ? '#3B82F6' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1">
        {/* Onglet Détail */}
        {activeTab === 'detail' && (
          <View className="p-5 space-y-4">
            {/* Image */}
            <View className="w-full h-48 rounded-lg bg-gray-200 overflow-hidden">
              {game.image ? (
                <Image
                  source={{ uri: game.image }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs mt-2">Aucune image</Text>
                </View>
              )}
            </View>

            {/* Note moyenne */}
            {averageRating > 0 && (
              <View className="bg-blue-50 p-3 rounded-lg">
                <InteractiveStarRating
                  rating={averageRating}
                  size={24}
                  readonly
                />
              </View>
            )}

            {/* Badges */}
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="neutral">
                {game.age_min}
                {game.age_max ? `-${game.age_max}` : '+'}
                {' ans'}
              </Badge>
              {game.tags.map((tag, index) => (
                <Badge key={index} variant={tag.includes('joueurs') ? 'info' : 'primary'}>
                  {tag}
                </Badge>
              ))}
            </View>

            {/* Description */}
            {game.description && (
              <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-700">{game.description}</Text>
              </View>
            )}
          </View>
        )}

        {/* Onglet Notes */}
        {activeTab === 'notes' && (
          <View className="p-5 space-y-4">
            {members.length > 0 ? (
              <>
                {members.map((member) => {
                  const memberRating = getMemberRating(member.id);
                  const avatarColor = getMemberAvatarColor(member.id);

                  return (
                    <View key={member.id} className="bg-white p-4 rounded-lg">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <View
                            className={`w-10 h-10 rounded-full items-center justify-center ${avatarColor.bg}`}
                          >
                            <Text className={`text-sm font-semibold ${avatarColor.text}`}>
                              {member.username.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text className="ml-3 font-medium text-gray-700">
                            {member.username}
                          </Text>
                        </View>
                        {memberRating > 0 && (
                          <TouchableOpacity
                            onPress={() => deleteMemberRating(member.id)}
                            className="p-2"
                          >
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                      <InteractiveStarRating
                        rating={memberRating}
                        onRatingChange={(rating) => setMemberRating(member.id, rating)}
                      />
                    </View>
                  );
                })}

                {/* Note moyenne */}
                {averageRating > 0 && (
                  <View className="bg-white p-4 rounded-lg">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-semibold text-blue-900">Note moyenne</Text>
                      <View className="flex-row items-center">
                        <InteractiveStarRating rating={averageRating} size={20} readonly />
                        <Text className="text-lg font-bold text-blue-600 ml-2">
                          {averageRating.toFixed(1)} / 5
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">Aucun membre dans la famille</Text>
              </View>
            )}
          </View>
        )}

        {/* Onglet Parties */}
        {activeTab === 'parties' && (
          <View className="p-5">
            <GameSessions gameId={gameId} />
          </View>
        )}

        {/* Onglet Podium */}
        {activeTab === 'podium' && (
          <View className="p-5">
            {top3Winners.length > 0 ? (
              <View className="bg-white rounded-lg p-4">
                {/* Podium */}
                <View className="flex-row items-end justify-center mb-6" style={{ height: 200 }}>
                  {/* 2ème place */}
                  {top3Winners[1] && (
                    <View className="flex-1 items-center mx-1">
                      <Text className="text-3xl mb-2">🥈</Text>
                      <View
                        className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${
                          getMemberAvatarColor(top3Winners[1].member.id).bg
                        }`}
                      >
                        <Text
                          className={`text-lg font-bold ${
                            getMemberAvatarColor(top3Winners[1].member.id).text
                          }`}
                        >
                          {top3Winners[1].member.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="bg-gray-300 w-full rounded-t-lg p-2" style={{ height: 90 }}>
                        <Text className="text-xs font-bold text-gray-800 text-center">2ème</Text>
                        <Text
                          className="text-sm font-bold text-gray-900 text-center"
                          numberOfLines={1}
                        >
                          {top3Winners[1].member.username}
                        </Text>
                        <Text className="text-xs text-gray-700 text-center mt-1">
                          {top3Winners[1].wins} {top3Winners[1].wins > 1 ? 'victoires' : 'victoire'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 1ère place */}
                  {top3Winners[0] && (
                    <View className="flex-1 items-center mx-1">
                      <Ionicons name="trophy" size={32} color="#FDB022" className="mb-2" />
                      <View
                        className={`w-20 h-20 rounded-full items-center justify-center mb-2 border-4 border-yellow-400 ${
                          getMemberAvatarColor(top3Winners[0].member.id).bg
                        }`}
                      >
                        <Text
                          className={`text-2xl font-bold ${
                            getMemberAvatarColor(top3Winners[0].member.id).text
                          }`}
                        >
                          {top3Winners[0].member.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="bg-yellow-400 w-full rounded-t-lg p-3" style={{ height: 120 }}>
                        <Text className="text-sm font-bold text-yellow-900 text-center">
                          🏆 1er 🏆
                        </Text>
                        <Text
                          className="text-lg font-bold text-yellow-900 text-center"
                          numberOfLines={1}
                        >
                          {top3Winners[0].member.username}
                        </Text>
                        <Text className="text-xs text-yellow-800 text-center mt-1">
                          {top3Winners[0].wins} {top3Winners[0].wins > 1 ? 'victoires' : 'victoire'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 3ème place */}
                  {top3Winners[2] && (
                    <View className="flex-1 items-center mx-1">
                      <Text className="text-3xl mb-2">🥉</Text>
                      <View
                        className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${
                          getMemberAvatarColor(top3Winners[2].member.id).bg
                        }`}
                      >
                        <Text
                          className={`text-lg font-bold ${
                            getMemberAvatarColor(top3Winners[2].member.id).text
                          }`}
                        >
                          {top3Winners[2].member.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="bg-amber-400 w-full rounded-t-lg p-2" style={{ height: 80 }}>
                        <Text className="text-xs font-bold text-amber-900 text-center">3ème</Text>
                        <Text
                          className="text-sm font-bold text-amber-900 text-center"
                          numberOfLines={1}
                        >
                          {top3Winners[2].member.username}
                        </Text>
                        <Text className="text-xs text-amber-800 text-center mt-1">
                          {top3Winners[2].wins} {top3Winners[2].wins > 1 ? 'victoires' : 'victoire'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="trophy-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4">Aucun gagnant pour le moment</Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  Jouez des parties pour voir le podium !
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
