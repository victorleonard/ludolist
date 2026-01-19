/**
 * Exemple de tests pour le store d'authentification
 * 
 * Pour exécuter ces tests :
 * 1. Installer vitest : npm install -D vitest @vue/test-utils
 * 2. Ajouter dans package.json : "test": "vitest"
 * 3. Exécuter : npm test
 */

import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth'

describe('AuthStore', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
  })

  describe('État initial', () => {
    it('devrait avoir un état initial correct', () => {
      const store = useAuthStore()
      
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Getters', () => {
    it('isAuthenticated devrait retourner true quand le token est présent', () => {
      const store = useAuthStore()
      
      store.token = 'fake-token'
      
      expect(store.isAuthenticated).toBe(true)
    })

    it('isAuthenticated devrait retourner false quand le token est null', () => {
      const store = useAuthStore()
      
      store.token = null
      
      expect(store.isAuthenticated).toBe(false)
    })

    it('currentUser devrait retourner l\'utilisateur actuel', () => {
      const store = useAuthStore()
      const mockUser = { id: 1, username: 'test', email: 'test@test.com', blocked: false }
      
      store.user = mockUser
      
      expect(store.currentUser).toEqual(mockUser)
    })
  })

  describe('Actions - saveToken', () => {
    it('devrait sauvegarder le token et l\'utilisateur', () => {
      const store = useAuthStore()
      const mockUser = { id: 1, username: 'test', email: 'test@test.com', blocked: false }
      const token = 'fake-token-123'
      
      store.saveToken(token, mockUser)
      
      expect(store.token).toBe(token)
      expect(store.user).toEqual(mockUser)
    })
  })

  describe('Actions - clearToken', () => {
    it('devrait effacer le token et l\'utilisateur', () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'test', email: 'test@test.com', blocked: false }
      store.token = 'fake-token'
      
      store.clearToken()
      
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Actions - login', () => {
    it('devrait authentifier l\'utilisateur avec succès', async () => {
      const store = useAuthStore()
      
      // Mock de $fetch
      const mockResponse = {
        jwt: 'fake-jwt-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com', blocked: false }
      }
      
      global.$fetch = vi.fn().mockResolvedValue(mockResponse)
      
      const result = await store.login('test@example.com', 'password123')
      
      expect(result.success).toBe(true)
      expect(store.token).toBe('fake-jwt-token')
      expect(store.user).toEqual(mockResponse.user)
      expect(store.isAuthenticated).toBe(true)
    })

    it('devrait gérer les erreurs de connexion', async () => {
      const store = useAuthStore()
      
      // Mock d'une erreur
      global.$fetch = vi.fn().mockRejectedValue({
        data: {
          error: {
            message: 'Identifiants invalides'
          }
        }
      })
      
      const result = await store.login('wrong@example.com', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Identifiants invalides')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Actions - fetchUser', () => {
    it('devrait récupérer les informations utilisateur', async () => {
      const store = useAuthStore()
      store.token = 'valid-token'
      
      const mockUser = { id: 1, username: 'test', email: 'test@test.com', blocked: false }
      global.$fetch = vi.fn().mockResolvedValue(mockUser)
      
      const user = await store.fetchUser()
      
      expect(user).toEqual(mockUser)
      expect(store.user).toEqual(mockUser)
    })

    it('devrait retourner null si pas de token', async () => {
      const store = useAuthStore()
      store.token = null
      
      const user = await store.fetchUser()
      
      expect(user).toBeNull()
    })

    it('devrait effacer le token en cas d\'erreur', async () => {
      const store = useAuthStore()
      store.token = 'invalid-token'
      store.user = { id: 1, username: 'test', email: 'test@test.com', blocked: false }
      
      global.$fetch = vi.fn().mockRejectedValue(new Error('Unauthorized'))
      
      const user = await store.fetchUser()
      
      expect(user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })
})
