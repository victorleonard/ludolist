import { useRouter, type Href } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuthStore } from '@/stores/auth';

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email requis';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Email invalide';
  }
  return undefined;
}

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/' as Href);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    const passwordError = !password ? 'Le mot de passe est requis' : undefined;

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setErrors({});
    setFormError(null);

    const result = await login(email, password);

    if (result.success) {
      router.replace('/' as Href);
    } else {
      setFormError(result.error ?? 'Identifiants incorrects');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <VStack className="mx-auto w-full max-w-md gap-6">
            <VStack className="items-center gap-2">
              <Heading size="3xl" className="text-primary-700">
                Ludolist
              </Heading>
              <Text size="sm" className="text-center text-typography-500">
                Accédez à votre espace personnel
              </Text>
            </VStack>

            <Box className="gap-5 rounded-2xl bg-background-0 p-6">
              <Heading size="xl">Connexion</Heading>

              {formError ? (
                <Alert action="error" variant="solid">
                  <AlertText>{formError}</AlertText>
                </Alert>
              ) : null}

              <FormControl isInvalid={!!errors.email} isDisabled={isLoading}>
                <FormControlLabel>
                  <FormControlLabelText>Email</FormControlLabelText>
                </FormControlLabel>
                <Input variant="outline" size="lg" isInvalid={!!errors.email}>
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    placeholder="votre@email.com"
                  />
                </Input>
                {errors.email ? (
                  <FormControlError>
                    <FormControlErrorText>{errors.email}</FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <FormControl isInvalid={!!errors.password} isDisabled={isLoading}>
                <FormControlLabel>
                  <FormControlLabelText>Mot de passe</FormControlLabelText>
                </FormControlLabel>
                <Input variant="outline" size="lg" isInvalid={!!errors.password}>
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    placeholder="••••••••"
                  />
                  <InputSlot
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityLabel={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    <InputIcon as={showPassword ? EyeOff : Eye} />
                  </InputSlot>
                </Input>
                {errors.password ? (
                  <FormControlError>
                    <FormControlErrorText>{errors.password}</FormControlErrorText>
                  </FormControlError>
                ) : null}
              </FormControl>

              <Button
                size="lg"
                onPress={handleSubmit}
                isDisabled={isLoading}
                className="mt-1"
              >
                {isLoading ? <ButtonSpinner color="white" /> : null}
                <ButtonText>Se connecter</ButtonText>
              </Button>
            </Box>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
