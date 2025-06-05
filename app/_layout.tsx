import '~/global.css';

import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Appearance, Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { AuthProvider } from '~/lib/context/auth';
import { Receipt } from '~/lib/icons/Receipt';
import { Images } from '~/lib/icons/Images';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

export default function RootLayout() {
  usePlatformSpecificSetup();
  const { isDarkColorScheme } = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <Tabs
          initialRouteName="traditional"
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDarkColorScheme ? NAV_THEME.dark.background : NAV_THEME.light.background,
              borderTopColor: isDarkColorScheme ? NAV_THEME.dark.border : NAV_THEME.light.border,
            },
            tabBarActiveTintColor: isDarkColorScheme ? NAV_THEME.dark.primary : NAV_THEME.light.primary,
            tabBarInactiveTintColor: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
          }}
        >
          <Tabs.Screen
            name="traditional"
            options={{
              title: 'Traditional',
              tabBarLabel: 'Traditional',
              tabBarIcon: ({ color, size }) => (
                <Receipt color={color} size={size} strokeWidth={1.5} />
              ),
            }}
          />
          <Tabs.Screen
            name="interactive"
            options={{
              title: 'Interactive',
              tabBarLabel: 'Interactive',
              tabBarIcon: ({ color, size }) => (
                <Images color={color} size={size} strokeWidth={1.5} />
              ),
            }}
          />
          {/* Hide these screens from the tab bar */}
          <Tabs.Screen
            name="index"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="+not-found"
            options={{
              href: null,
            }}
          />
        </Tabs>
        <PortalHost />
      </ThemeProvider>
    </AuthProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

function useSetWebBackgroundClassName() {
  useIsomorphicLayoutEffect(() => {
    // Adds the background color to the html element to prevent white background on overscroll.
    document.documentElement.classList.add('bg-background');
  }, []);
}

function useSetAndroidNavigationBar() {
  React.useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? 'light');
  }, []);
}

function noop() {}
