export const useRecherche = () => {
  const recherche = useState<string>('recherche', () => '')

  return {
    recherche
  }
}
