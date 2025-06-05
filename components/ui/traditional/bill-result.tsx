import * as React from 'react';
import { View } from 'react-native';
import { Text } from '../text';

interface BillResultProps {
  amount: number;
}

export function BillResult({ amount }: BillResultProps) {
  return (
    <View className="w-full py-6 space-y-2">
      <Text className="text-base text-muted-foreground text-center">Each person pays:</Text>
      <Text className="text-3xl font-bold text-primary text-center">
        ${amount.toFixed(2)}
      </Text>
    </View>
  );
} 