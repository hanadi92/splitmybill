import * as React from 'react';
import { View } from 'react-native';
import { BillSplitter } from '~/components/BillSplitter';

export default function Screen() {
  return (
    <View className='flex-1 bg-background'>
      <BillSplitter />
    </View>
  );
}
