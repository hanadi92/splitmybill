import * as React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../text';
import { Button } from '../button';
import { Card } from '../card';
import { Trash2 } from '~/lib/icons/Trash';
import { CirclePlus } from '~/lib/icons/CirclePlus';
import { Input } from '../input';

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

export function BillResult({ total: initialTotal, items: initialItems, onSubmit }: BillResultProps) {
  const [items, setItems] = React.useState<Item[]>(initialItems);
  const [total, setTotal] = React.useState(initialTotal);
  const [isEditingTotal, setIsEditingTotal] = React.useState(false);

  // Update total when items change
  const recalculateTotal = React.useCallback(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [items]);

  // Handle item updates
  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'name') {
      item.name = value;
    } else if (field === 'price') {
      const price = parseFloat(value) || 0;
      item.price = price;
    } else if (field === 'quantity') {
      const quantity = parseInt(value) || 0;
      item.quantity = quantity;
    }

    newItems[index] = item;
    setItems(newItems);
    recalculateTotal();
  };

  // Add new item
  const addItem = () => {
    setItems([...items, { name: '', price: 0, quantity: 1 }]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    recalculateTotal();
  };

  // Handle manual total update
  const updateTotal = (value: string) => {
    const newTotal = parseFloat(value) || 0;
    setTotal(newTotal);
  };

  return (
    <View className="w-full py-6 space-y-4">
      <Text className="text-base text-muted-foreground text-center">Digitalized Bill:</Text>
      
      <View className="space-y-2">
        {items.map((item, index) => (
          <Card key={`${item.name}-${index}`} className="p-3">
            <View className="flex-row justify-between items-center space-x-2">
              <Input
                className="flex-2 p-2 rounded text-sm"
                value={item.quantity.toString()}
                onChangeText={(value) => updateItem(index, 'quantity', value)}
                keyboardType="numeric"
                placeholder="Qty"
              />
              <Input
                className="flex-2 p-2 rounded text-sm"
                value={item.name}
                onChangeText={(value) => updateItem(index, 'name', value)}
                placeholder="Item name"
              />
              <Input
                className="flex-2 p-2 rounded text-sm text-right"
                value={item.price.toFixed(2)}
                onChangeText={(value) => updateItem(index, 'price', value)}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              <Pressable 
                onPress={() => removeItem(index)}
                className="p-2"
              >
                <Trash2 size={20} className="text-foreground" />
              </Pressable>
            </View>
          </Card>
        ))}

        <Button 
          variant="outline" 
          className="flex-row w-full items-center justify-center gap-1" 
          onPress={addItem}
        >
          <CirclePlus size={20} className="text-foreground" />
          <Text>Add Item</Text>
        </Button>
      </View>

      <View className="pt-4 border-t border-border">
        <Pressable onPress={() => setIsEditingTotal(true)}>
          {isEditingTotal ? (
            <Input
              className="text-lg font-semibold text-right p-2 rounded"
              value={total.toFixed(2)}
              onChangeText={updateTotal}
              onBlur={() => setIsEditingTotal(false)}
              keyboardType="decimal-pad"
              autoFocus
            />
          ) : (
            <Text className="text-lg font-semibold text-right">
              Total: ${total.toFixed(2)}
            </Text>
          )}
        </Pressable>
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