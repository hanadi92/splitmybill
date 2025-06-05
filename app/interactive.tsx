import * as React from 'react';
import { View } from 'react-native';
import { InteractiveBillSplitter } from '~/components/InteractiveBillSplitter';

export default function InteractiveScreen() {
  return (
    <View className='flex-1 bg-background'>
      <InteractiveBillSplitter />
    </View>
  );
} 