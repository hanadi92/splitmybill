import * as React from 'react';
import { View } from 'react-native';
import { TraditionalBillSplitter } from '~/components/TraditionalBillSplitter';

export default function Screen() {
  return (
    <View className='flex-1 bg-background'>
      <TraditionalBillSplitter />
    </View>
  );
}
