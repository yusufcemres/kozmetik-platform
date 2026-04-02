import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import IngredientDetailScreen from '../screens/IngredientDetailScreen';
import NeedDetailScreen from '../screens/NeedDetailScreen';
import ScanScreen from '../screens/ScanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoutineScreen from '../screens/RoutineScreen';
import CompareScreen from '../screens/CompareScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

// === Types ===

export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { slug: string };
  IngredientDetail: { slug: string };
  NeedDetail: { slug: string };
  Search: { query?: string };
  Compare: { productIds: number[] };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { slug: string };
  IngredientDetail: { slug: string };
  NeedDetail: { slug: string };
  Search: { query?: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Routine: undefined;
  Favorites: undefined;
  Compare: { productIds: number[] };
};

// === Navigators ===

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ScanStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Kozmetik Platform' }}
      />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Arama' }}
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Ürün Detay' }}
      />
      <HomeStack.Screen
        name="IngredientDetail"
        component={IngredientDetailScreen}
        options={{ title: 'İçerik Detay' }}
      />
      <HomeStack.Screen
        name="NeedDetail"
        component={NeedDetailScreen}
        options={{ title: 'İhtiyaç Detay' }}
      />
    </HomeStack.Navigator>
  );
}

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen
        name="ScanMain"
        component={ScanScreen}
        options={{ title: 'Tara' }}
      />
    </ScanStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profilim' }}
      />
      <ProfileStack.Screen
        name="Routine"
        component={RoutineScreen}
        options={{ title: 'Rutinim' }}
      />
      <ProfileStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorilerim' }}
      />
      <ProfileStack.Screen
        name="Compare"
        component={CompareScreen}
        options={{ title: 'Karşılaştır' }}
      />
    </ProfileStack.Navigator>
  );
}

// Tab icon helper
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Ana: '🏠',
    Tara: '📷',
    Profil: '👤',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '●'}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Ana"
          component={HomeStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Ana" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Tara"
          component={ScanStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Tara" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Profil"
          component={ProfileStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Profil" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
