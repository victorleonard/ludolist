import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Validation de l'email
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    // Validation du mot de passe
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      // Navigation vers l'écran principal
      router.replace('/(tabs)');
    } else {
      Alert.alert(
        'Erreur de connexion',
        result.error || 'Identifiants incorrects',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-100"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 p-5 justify-center">
        {/* Logo */}
        <View className="items-center mb-10">
          <Ionicons name="people" size={80} color="#3B82F6" />
          <Text className="text-3xl font-bold text-gray-900 mt-3">Team Family</Text>
        </View>

        {/* Titre */}
        <Text className="text-4xl font-bold text-gray-900 mb-2">Connexion</Text>
        <Text className="text-base text-gray-500 mb-8">
          Connectez-vous pour gérer votre famille
        </Text>

        {/* Formulaire */}
        <View className="mb-6">
          {/* Champ Email */}
          <View className={`flex-row items-center bg-white rounded-xl mb-5 px-4 ${errors.email ? 'border border-red-500' : ''}`}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#6B7280"
              className="mr-3"
            />
            <TextInput
              className="flex-1 h-14 text-base text-gray-900"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>
          {errors.email && (
            <Text className="text-red-500 text-sm mb-2 ml-1">{errors.email}</Text>
          )}

          {/* Champ Mot de passe */}
          <View className={`flex-row items-center bg-white rounded-xl mb-2 px-4 ${errors.password ? 'border border-red-500' : ''}`}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#6B7280"
              className="mr-3"
            />
            <TextInput
              className="flex-1 h-14 text-base text-gray-900"
              placeholder="Mot de passe"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
            />
            <TouchableOpacity
              className="p-2"
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-sm mb-2 ml-1">{errors.password}</Text>
          )}

          {/* Lien mot de passe oublié */}
          <TouchableOpacity
            className="self-end mb-6 mt-2"
            disabled={isLoading}
          >
            <Text className="text-blue-500 text-sm font-medium">
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          {/* Bouton de connexion */}
          <TouchableOpacity
            className={`flex-row items-center justify-center h-14 rounded-xl gap-2 ${isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white text-base font-bold">Se connecter</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Lien d'inscription */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-500 text-sm">Pas encore de compte ? </Text>
          <TouchableOpacity disabled={isLoading}>
            <Text className="text-blue-500 text-sm font-bold">S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
