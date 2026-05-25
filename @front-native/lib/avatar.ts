/** Classes statiques (requis pour NativeWind — pas de concat dynamique) */
const AVATAR_BG_CLASSES = [
  'bg-primary-500',
  'bg-primary-600',
  'bg-success-500',
  'bg-warning-500',
  'bg-error-500',
  'bg-info-500',
  'bg-secondary-600',
  'bg-tertiary-500',
] as const;

function colorIndex(identifier: number | string): number {
  if (typeof identifier === 'number') {
    return Math.abs(identifier) % AVATAR_BG_CLASSES.length;
  }
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_BG_CLASSES.length;
}

/** Première lettre du prénom (1er mot du nom affiché) */
export function getInitialFromDisplayName(displayName: string): string {
  const firstName = displayName.trim().split(/\s+/)[0] ?? '';
  return (firstName.charAt(0) || '?').toUpperCase();
}

export function getAvatarBackgroundClass(
  identifier: number | string,
): (typeof AVATAR_BG_CLASSES)[number] {
  return AVATAR_BG_CLASSES[colorIndex(identifier)];
}
