import React, { useState, useEffect } from 'react';
import { View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '~/lib/context/auth';
import { supabase } from '~/lib/services/supabase';

export function BillSplitter() {
  const { session, loading: authLoading, signInAnonymously } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [numPeople, setNumPeople] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // Auto sign in anonymously if not signed in
  useEffect(() => {
    if (!authLoading && !session) {
      signInAnonymously().catch(console.error);
    }
  }, [authLoading, session, signInAnonymously]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // @ts-ignore
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        // Store the base64 data with the data URI prefix
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImage(base64Image);
        setResult(null); // Reset result when new image is picked
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null); // Reset result when new photo is taken
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Error taking photo. Please try again.');
    }
  };

  const handleBillAnalysis = async () => {
    if (!image) {
      alert('Please select an image first');
      return;
    }

    if (!session) {
      alert('Please wait while we set up your session');
      return;
    }

    setLoading(true);
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-bill', {
        body: {
          imageUri: image,
          numPeople,
        },
      });

      if (error) throw error;

      if (!data?.analysis) {
        throw new Error('Invalid response format from server');
      }

      console.log(data.analysis);
      // First try to extract JSON if present
      const jsonMatch = data.analysis.match(/\{[^}]+\}/g);
      let splitAmount: number | null = null;
      
      if (jsonMatch) {
        // Try parsing structured JSON response
        try {
          const lastJson = jsonMatch[jsonMatch.length - 1];
          const analysisResult = JSON.parse(lastJson);
          if (analysisResult.splitAmount && typeof analysisResult.splitAmount === 'number') {
            splitAmount = analysisResult.splitAmount;
          }
        } catch (e) {
          console.log('Failed to parse JSON, trying narrative format');
        }
      }

      // If JSON parsing failed, try to extract amount from narrative text
      if (!splitAmount) {
        const amountMatch = data.analysis.match(/\$(\d+\.?\d*)/g);
        if (amountMatch && amountMatch.length > 0) {
          // Get the last dollar amount mentioned (usually the split amount)
          const lastAmount = amountMatch[amountMatch.length - 1];
          splitAmount = parseFloat(lastAmount.replace('$', ''));
        }
      }

      if (!splitAmount) {
        throw new Error('Could not extract split amount from response');
      }

      setResult(splitAmount);
    } catch (error) {
      console.error('Error analyzing bill:', error);
      alert('Error analyzing bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Setting up your session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Split My Bill</CardTitle>
        </CardHeader>
        <CardContent className="items-center space-y-4">
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-48 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 bg-muted rounded-lg items-center justify-center">
              <Text className="text-muted-foreground">No image selected</Text>
            </View>
          )}

          <View className="flex-row space-x-2">
            <Button className="flex-1" onPress={takePhoto}>
              <Text>Take Photo</Text>
            </Button>
            <Button className="flex-1" onPress={pickImage}>
              <Text>Pick Image</Text>
            </Button>
          </View>

          <View className="flex-row items-center space-x-4">
            <Text>Split between:</Text>
            <View className="flex-row items-center space-x-2">
              <Button
                onPress={() => numPeople > 1 && setNumPeople(n => n - 1)}
                variant="outline"
              >
                <Text>-</Text>
              </Button>
              <Text className="min-w-[40px] text-center">{numPeople}</Text>
              <Button
                onPress={() => setNumPeople(n => n + 1)}
                variant="outline"
              >
                <Text>+</Text>
              </Button>
            </View>
          </View>

          <Button
            className="w-full"
            onPress={handleBillAnalysis}
            disabled={!image || loading || !session}
          >
            <Text>{loading ? 'Analyzing...' : 'Split Bill'}</Text>
          </Button>
        </CardContent>

        {result !== null && (
          <CardFooter className="flex-col items-center">
            <Text className="text-lg font-semibold">Each person pays:</Text>
            <Text className="text-2xl font-bold text-primary">
              ${result.toFixed(2)}
            </Text>
          </CardFooter>
        )}
      </Card>
    </View>
  );
} 