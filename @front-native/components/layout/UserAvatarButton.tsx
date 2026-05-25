import { MemberAvatar } from '@/components/ui/MemberAvatar';
import { Pressable } from '@/components/ui/pressable';
import { useAuthStore } from '@/stores/auth';

type UserAvatarButtonProps = {
  onPress?: () => void;
};

export function UserAvatarButton({ onPress }: UserAvatarButtonProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-full active:opacity-80"
      accessibilityLabel={`Profil : ${user.username}`}
      accessibilityRole="button"
    >
      <MemberAvatar
        displayName={user.username}
        colorKey={user.id}
        size="xs"
        showRing
      />
    </Pressable>
  );
}
