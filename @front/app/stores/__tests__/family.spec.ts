/**
 * Exemple de tests pour le store de famille
 * 
 * Pour exécuter ces tests :
 * 1. Installer vitest : npm install -D vitest @vue/test-utils
 * 2. Ajouter dans package.json : "test": "vitest"
 * 3. Exécuter : npm test
 */

import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFamilyStore } from '../family'
import { useAuthStore } from '../auth'

describe('FamilyStore', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
  })

  describe('État initial', () => {
    it('devrait avoir un état initial correct', () => {
      const store = useFamilyStore()
      
      expect(store.family).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.hasFamily).toBe(false)
    })
  })

  describe('Getters', () => {
    it('currentFamily devrait retourner la famille actuelle', () => {
      const store = useFamilyStore()
      const mockFamily = { id: 1, name: 'Test Family', members: [], games: [] }
      
      store.family = mockFamily
      
      expect(store.currentFamily).toEqual(mockFamily)
    })

    it('familyMembers devrait retourner les membres de la famille', () => {
      const store = useFamilyStore()
      const mockMembers = [
        { id: 1, name: 'Alice', birthdate: '2010-01-01' },
        { id: 2, name: 'Bob', birthdate: '2012-05-15' }
      ]
      
      store.family = { id: 1, name: 'Test', members: mockMembers }
      
      expect(store.familyMembers).toEqual(mockMembers)
    })

    it('familyMembers devrait retourner un tableau vide si pas de famille', () => {
      const store = useFamilyStore()
      
      expect(store.familyMembers).toEqual([])
    })

    it('familyGames devrait retourner les jeux de la famille', () => {
      const store = useFamilyStore()
      const mockGames = [
        { id: 1, name: 'Catan' },
        { id: 2, name: 'Ticket to Ride' }
      ]
      
      store.family = { id: 1, name: 'Test', games: mockGames }
      
      expect(store.familyGames).toEqual(mockGames)
    })

    it('hasFamily devrait retourner true quand une famille existe', () => {
      const store = useFamilyStore()
      
      store.family = { id: 1, name: 'Test' }
      
      expect(store.hasFamily).toBe(true)
    })

    it('hasFamily devrait retourner false quand pas de famille', () => {
      const store = useFamilyStore()
      
      expect(store.hasFamily).toBe(false)
    })
  })

  describe('Actions - saveFamily', () => {
    it('devrait sauvegarder la famille', () => {
      const store = useFamilyStore()
      const mockFamily = { id: 1, name: 'Test Family', members: [], games: [] }
      
      store.saveFamily(mockFamily)
      
      expect(store.family).toEqual(mockFamily)
      expect(store.hasFamily).toBe(true)
    })
  })

  describe('Actions - clearFamily', () => {
    it('devrait effacer la famille', () => {
      const store = useFamilyStore()
      store.family = { id: 1, name: 'Test' }
      
      store.clearFamily()
      
      expect(store.family).toBeNull()
      expect(store.hasFamily).toBe(false)
    })
  })

  describe('Actions - fetchFamily', () => {
    it('devrait récupérer la famille avec succès', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = 'valid-token'
      
      const mockResponse = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        family: {
          id: 1,
          name: 'Test Family',
          members: [
            { id: 1, name: 'Alice', birthdate: '2010-01-01' }
          ]
        }
      }
      
      global.$fetch = vi.fn().mockResolvedValue(mockResponse)
      
      const result = await familyStore.fetchFamily()
      
      expect(result).toEqual(mockResponse.family)
      expect(familyStore.family).toEqual(mockResponse.family)
      expect(familyStore.isLoading).toBe(false)
    })

    it('devrait retourner null si pas de token', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = null
      
      const result = await familyStore.fetchFamily()
      
      expect(result).toBeNull()
      expect(familyStore.family).toBeNull()
    })

    it('devrait retourner null si l\'utilisateur n\'a pas de famille', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = 'valid-token'
      
      const mockResponse = {
        id: 1,
        username: 'test',
        email: 'test@test.com'
        // Pas de famille
      }
      
      global.$fetch = vi.fn().mockResolvedValue(mockResponse)
      
      const result = await familyStore.fetchFamily()
      
      expect(result).toBeNull()
      expect(familyStore.family).toBeNull()
    })

    it('devrait gérer les erreurs lors de la récupération', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = 'valid-token'
      
      global.$fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      const result = await familyStore.fetchFamily()
      
      expect(result).toBeNull()
      expect(familyStore.isLoading).toBe(false)
    })
  })

  describe('Actions - updateFamilyName', () => {
    it('devrait mettre à jour le nom de la famille', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = 'valid-token'
      familyStore.family = { id: 1, name: 'Old Name' }
      
      const updatedFamily = { id: 1, name: 'New Name' }
      global.$fetch = vi.fn().mockResolvedValue(updatedFamily)
      
      const result = await familyStore.updateFamilyName('New Name')
      
      expect(result.success).toBe(true)
      expect(familyStore.family?.name).toBe('New Name')
    })

    it('devrait retourner une erreur si pas de famille', async () => {
      const familyStore = useFamilyStore()
      
      const result = await familyStore.updateFamilyName('New Name')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Aucune famille trouvée')
    })

    it('devrait gérer les erreurs de mise à jour', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = 'valid-token'
      familyStore.family = { id: 1, name: 'Old Name' }
      
      global.$fetch = vi.fn().mockRejectedValue({
        data: {
          error: {
            message: 'Erreur serveur'
          }
        }
      })
      
      const result = await familyStore.updateFamilyName('New Name')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erreur serveur')
    })
  })

  describe('Intégration avec AuthStore', () => {
    it('devrait utiliser le token du authStore pour fetchFamily', async () => {
      const authStore = useAuthStore()
      const familyStore = useFamilyStore()
      
      authStore.token = 'valid-token-123'
      
      const mockResponse = {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        family: { id: 1, name: 'Test Family' }
      }
      
      global.$fetch = vi.fn().mockResolvedValue(mockResponse)
      
      await familyStore.fetchFamily()
      
      expect(global.$fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer valid-token-123'
          }
        })
      )
    })
  })
})
