import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { ThemeToggle } from '~/components/ThemeToggle';

interface BillHeaderProps {
  title: string;
}

export function BillHeader({ title }: BillHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-2xl font-bold">{title}</Text>
      <ThemeToggle />
    </View>
  );
} 