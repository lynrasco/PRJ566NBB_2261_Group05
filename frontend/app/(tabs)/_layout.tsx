import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
//import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/context/theme-context';

export default function TabLayout() {
  //const colorScheme = useColorScheme();
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? '#8bbcff' : '#024883',
        tabBarInactiveTintColor: isDark ? '#b8c4d1' : '#7b8793',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          height: 75,
          width: '85%',
          marginHorizontal: 30,
          borderRadius: 40,
          backgroundColor: isDark ? '#121c2b' : '#00213B',
          borderWidth: isDark ? 1 : 0,
          borderColor: '#2d3a4a',
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.35 : 0.1,
          shadowRadius: 10,
          elevation: 10,
          paddingTop: 15,
          paddingBottom: 10,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          flex: 1,
          width: 70,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginHorizontal: 20,
        },
      }}
      >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarStyle: { display: 'none' },
          tabBarLabel: '',
          tabBarIcon: ({ color }) => <IconSymbol size={34} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'Items',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person" color={color} />,
          }}
        />
    </Tabs>
  );
}