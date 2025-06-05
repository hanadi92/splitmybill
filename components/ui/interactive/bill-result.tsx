import * as React from 'react';
import { View } from 'react-native';
import { Text } from '../text';
import { Button } from '../button';
import { Card } from '../card';

export interface Item {
  name: string;
  price: number;
  quantity: number;
}

interface BillResultProps {
  total: number;
  items: Array<Item>;
  onSubmit?: () => void;
}

export function BillResult({ total, items, onSubmit }: BillResultProps) {
  return (
    <View className="w-full py-6 space-y-4">
      <Text className="text-base text-muted-foreground text-center">Digitalized Bill:</Text>
      
      <View className="space-y-2">
        {items.map((item, index) => (
          <Card key={`${item.name}-${index}`} className="p-3 flex-row justify-between items-center">
            <Text className="text-sm flex-1">{item.quantity}</Text>
            <Text className="text-sm flex-1">{item.name}</Text>
            <Text className="text-sm font-medium">${item.price.toFixed(2)}</Text>
          </Card>
        ))}
      </View>

      <View className="pt-4 border-t border-border">
        <Text className="text-lg font-semibold text-right">
          Total: ${total.toFixed(2)}
        </Text>
      </View>

      {onSubmit && (
        <Button 
          className="w-full mt-4" 
          onPress={onSubmit}
        >
          <Text>Confirm Bill</Text>
        </Button>
      )}
    </View>
  );
} 