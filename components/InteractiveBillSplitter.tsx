import * as React from 'react';
import { View } from 'react-native';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { useAuth } from '~/lib/context/auth';
import { useImagePicker } from '~/lib/hooks/useImagePicker';
import { useInteractiveBillAnalysis } from '~/lib/hooks/useBillAnalysis';
import { BillSplitterUI } from './ui/interactive/bill-splitter-ui';

export function InteractiveBillSplitter() {
  const { session, loading: authLoading, signInAnonymously } = useAuth();
  const { image, setImage, pickImage, takePhoto } = useImagePicker();
  const { loading, result, setResult, analyzeBill } = useInteractiveBillAnalysis();

  const handleBillAnalysis = async () => {
    if (image) {
      await analyzeBill(image);
    }
  };

  const handleSubmit = async () => {
    // TODO: Implement the submission logic here
    // For now, just clear the form
    setImage(null);
    setResult(null);
  };

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

  return (
    <BillSplitterUI
      title="Interactive Bill Splitter"
      image={image}
      loading={loading}
      result={result}
      onImagePick={pickImage}
      onPhotoTake={takePhoto}
      onImageClear={() => {
        setImage(null);
        setResult(null);
      }}
      onAnalyze={handleBillAnalysis}
      onSubmit={handleSubmit}
    />
  );
} 