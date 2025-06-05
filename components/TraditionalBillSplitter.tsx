import * as React from 'react';
import { View } from 'react-native';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { useAuth } from '~/lib/context/auth';
import { BillSplitterUI } from './ui/traditional/bill-splitter-ui';
import { useImagePicker } from '~/lib/hooks/useImagePicker';
import { useBillAnalysis } from '~/lib/hooks/useBillAnalysis';
import { useState } from 'react';

export function TraditionalBillSplitter() {
  const { session, loading: authLoading, signInAnonymously } = useAuth();
  const [numPeople, setNumPeople] = useState(2);
  const { image, setImage, pickImage, takePhoto } = useImagePicker();
  const { loading, result, setResult, analyzeBill } = useBillAnalysis();

  if (authLoading) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Button onPress={signInAnonymously}>
          <Text>Sign In Anonymously</Text>
        </Button>
      </View>
    );
  }

  const handleBillAnalysis = async () => {
    if (image) {
      await analyzeBill(image, numPeople);
    }
  };

  return (
    <BillSplitterUI
      title="Split my bill"
      image={image}
      numPeople={numPeople}
      loading={loading}
      result={result}
      onImagePick={pickImage}
      onPhotoTake={takePhoto}
      onImageClear={() => {
        setImage(null);
        setResult(null);
      }}
      onNumPeopleChange={(change) => setNumPeople(n => n + change)}
      onAnalyze={handleBillAnalysis}
    />
  );
} 