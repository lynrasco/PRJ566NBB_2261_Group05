import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          height: 75,
          borderRadius: 40,
          backgroundColor: "#00213B",
          width: "85%",
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
          marginHorizontal: 30,
          paddingTop: 15,
          paddingBottom: 10,
          justifyContent: 'center',
        },
        tabBarItemStyle: {
          flex: 1,
          width: 70,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginHorizontal: 20
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={50} name="house" color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => <IconSymbol size={50} name="plus.circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={50} name="gearshape" color={color} />,
          }}
        />
    </Tabs>
  );
}
