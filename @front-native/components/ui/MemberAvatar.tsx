import {
  Avatar,
  AvatarFallbackText,
} from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import {
  getAvatarBackgroundClass,
  getInitialFromDisplayName,
} from '@/lib/avatar';

type MemberAvatarProps = {
  displayName: string;
  colorKey?: number | string;
  size?: 'xs' | 'sm' | 'md';
  showRing?: boolean;
};

/** Tailles Ludolist → tailles Gluestack Avatar */
const GLUESTACK_SIZE = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
} as const;

export function MemberAvatar({
  displayName,
  colorKey,
  size = 'md',
  showRing = false,
}: MemberAvatarProps) {
  const initial = getInitialFromDisplayName(displayName);
  const bgClass = getAvatarBackgroundClass(colorKey ?? displayName);

  const avatar = (
    <Avatar size={GLUESTACK_SIZE[size]} className={bgClass}>
      <AvatarFallbackText>{initial}</AvatarFallbackText>
    </Avatar>
  );

  if (showRing) {
    return (
      <Box className="rounded-full p-0.5 ring-2 ring-primary-500">{avatar}</Box>
    );
  }

  return avatar;
}
