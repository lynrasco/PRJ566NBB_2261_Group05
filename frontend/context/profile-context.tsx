import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { ImageSourcePropType } from 'react-native';

export type AvatarId = 'avatar-1' | 'avatar-2' | 'avatar-3' | 'avatar-4' | 'avatar-5';

type Profile = {
  username: string;
  name: string;
  phone: string;
  email: string;
  avatarId: AvatarId;
};

type ProfileContextValue = {
  profile: Profile;
  avatars: { id: AvatarId; source: ImageSourcePropType }[];
  avatarSource: ImageSourcePropType;
  updateProfile: (profile: Profile) => void;
};

const avatars: { id: AvatarId; source: ImageSourcePropType }[] = [
  { id: 'avatar-1', source: require('@/assets/images/avatar-1.png') },
  { id: 'avatar-2', source: require('@/assets/images/avatar-2.png') },
  { id: 'avatar-3', source: require('@/assets/images/avatar-3.png') },
  { id: 'avatar-4', source: require('@/assets/images/avatar-4.png') },
  { id: 'avatar-5', source: require('@/assets/images/avatar-5.png') },
];

/*
const defaultProfile: Profile = {
  username: 'lindaflips',
  name: 'Linda Carter',
  phone: '(416) 555-0198',
  email: 'linda.carter@example.com',
  avatarId: 'avatar-1',
};
*/
const defaultProfile: Profile = {
    username: "",
    name: "",
    phone: "",
    email: "",
    avatarId: "avatar-1",
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState(defaultProfile);

  const value = useMemo(() => {
    const avatarSource =
      avatars.find((avatar) => avatar.id === profile.avatarId)?.source || avatars[0].source;

    return {
      profile,
      avatars,
      avatarSource,
      updateProfile: setProfile,
    };
  }, [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used inside ProfileProvider');
  }

  return context;
}

