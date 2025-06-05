import * as React from 'react';
import { View } from 'react-native';
import { Text } from '../text';

export interface Item {
  name: string;
  price: number;
}

interface BillResultProps {
  total: number;
  items: Array<Item>;
}

export function BillResult({ total, items }: BillResultProps) {
  return (
    <View className="w-full py-6 space-y-2">
      <Text className="text-base text-muted-foreground text-center">Digitalized Bill:</Text>
      <Text className="text-3xl font-bold text-primary text-center">
        ${total.toFixed(2)}
      </Text>
      {items.map((item) => (
        <Text key={item.name}>{item.name}: ${item.price.toFixed(2)}</Text>
      ))}
    </View>
  );
} 