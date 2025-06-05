import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { Button } from './button';

interface PeopleCounterProps {
  value: number;
  onChange: (change: -1 | 1) => void;
}

export function PeopleCounter({ value, onChange }: PeopleCounterProps) {
  return (
    <View className="rounded-lg p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base">Split between:</Text>
        <View className="flex-row items-center space-x-6">
          <Button
            onPress={() => value > 1 && onChange(-1)}
            variant="outline"
            className="h-14 w-14 rounded-full bg-background border-2"
          >
            <Text className="text-2xl">-</Text>
          </Button>
          <Text className="text-2xl font-medium min-w-[32px] text-center">
            {value}
          </Text>
          <Button
            onPress={() => onChange(1)}
            variant="outline"
            className="h-14 w-14 rounded-full bg-background border-2"
          >
            <Text className="text-2xl">+</Text>
          </Button>
        </View>
      </View>
    </View>
  );
} 