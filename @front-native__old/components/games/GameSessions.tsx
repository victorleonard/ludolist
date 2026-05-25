import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyStore } from '@/stores/familyStore';

interface PlayerScore {
  id: number;
  score: number;
  is_winner?: boolean;
  position?: number;
  member: {
    id: number;
    username: string;
  };
}

interface GameSession {
  id: number;
  played_at: string;
  notes?: string;
  player_scores?: PlayerScore[];
}

interface GameSessionsProps {
  gameId: number;
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
];

const getMemberAvatarColor = (memberId: number) => {
  return AVATAR_COLORS[memberId % AVATAR_COLORS.length];
};

const sortedScores = (scores: PlayerScore[]) => {
  return [...scores].sort((a, b) => {
    if (a.is_winner && !b.is_winner) return -1;
    if (!a.is_winner && b.is_winner) return 1;
    return b.score - a.score;
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function GameSessions({ gameId }: GameSessionsProps) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const familyStore = useFamilyStore();

  useEffect(() => {
    loadSessions();
  }, [gameId]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const result = await familyStore.fetchGameSessions(gameId);
      if (result.success && result.data) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des parties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="game-controller-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 mt-4">Aucune partie enregistrée pour ce jeu</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <View className="space-y-4">
          {sessions.map((session) => {
            const scores = session.player_scores || [];
            const sortedPlayerScores = sortedScores(scores);

            return (
              <View key={session.id} className="bg-white p-4 rounded-lg mb-4">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="font-semibold text-gray-900">
                      {formatDate(session.played_at)}
                    </Text>
                  </View>
                  {session.notes && (
                    <View className="bg-gray-100 px-2 py-1 rounded-md flex-row items-center gap-1">
                      <Ionicons name="document-text-outline" size={12} color="#6B7280" />
                      <Text className="text-xs text-gray-600">Notes</Text>
                    </View>
                  )}
                </View>

                {/* Notes */}
                {session.notes && (
                  <View className="mb-3">
                    <Text className="text-sm text-gray-600 italic">{session.notes}</Text>
                  </View>
                )}

                {/* Scores */}
                <View className="space-y-2">
                  {sortedPlayerScores.map((score, index) => {
                    const avatarColor = getMemberAvatarColor(score.member.id);
                    const isWinner = score.is_winner;

                    return (
                      <View
                        key={score.id}
                        className={`flex-row items-center justify-between p-2 rounded ${
                          isWinner ? 'bg-blue-50' : ''
                        }`}
                      >
                        <View className="flex-row items-center gap-3">
                          {/* Position ou Crown */}
                          <View className="w-4 items-center justify-center">
                            {isWinner ? (
                              <Ionicons name="trophy" size={16} color="#EAB308" />
                            ) : (
                              <Text className="text-xs text-gray-400">
                                {score.position || index + 1}
                              </Text>
                            )}
                          </View>

                          {/* Avatar */}
                          <View
                            className={`w-8 h-8 rounded-full items-center justify-center ${avatarColor.bg}`}
                          >
                            <Text className={`text-xs font-semibold ${avatarColor.text}`}>
                              {score.member.username.charAt(0).toUpperCase()}
                            </Text>
                          </View>

                          {/* Nom */}
                          <Text className="font-medium text-gray-900">
                            {score.member.username}
                          </Text>
                        </View>

                        {/* Score */}
                        <Text className="font-bold text-gray-900">{score.score}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
