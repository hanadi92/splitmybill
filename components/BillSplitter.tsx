import React, { useState, useEffect } from 'react';
import {View, Image, Pressable, Animated} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '~/lib/context/auth';
import { supabase } from '~/lib/services/supabase';
import { Camera } from '~/lib/icons/Camera';
import { Images } from '~/lib/icons/Images';
import { Trash2 } from '~/lib/icons/Trash';
import { ThemeToggle } from './ThemeToggle';
import ScrollView = Animated.ScrollView;

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
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 container mx-auto px-4 py-6 min-h-screen items-center justify-center">
        <Card className="w-full max-w-md web:shadow-xl web:dark:shadow-foreground">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                <Text className="text-2xl font-bold">Split My Bill</Text>
              </CardTitle>
              <ThemeToggle />
            </View>
          </CardHeader>

          <CardContent className="flex-1 gap-4">
            <Pressable 
              onPress={pickImage}
              className="w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 border-foreground border-dashed relative"
            >
              {image ? (
                <>
                  <Image
                    source={{ uri: image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Pressable 
                    onPress={() => {
                      setImage(null);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 bg-background/80 p-2 rounded-full"
                  >
                    <Trash2 className="text-foreground" size={20} strokeWidth={1.25} />
                  </Pressable>
                </>
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Images className="w-12 h-12 mb-3 text-muted-foreground" />
                  <Text className="text-sm text-muted-foreground">Tap to select an image</Text>
                </View>
              )}
            </Pressable>

            <View className="gap-4">
              <View className="flex-row justify-between gap-4">
                <Button 
                  className="flex-1 flex-row items-center justify-center gap-1"
                  onPress={takePhoto}
                >
                  <Camera className='text-secondary' size={20} strokeWidth={1.25} />
                  <Text>Take Photo</Text>
                </Button>
                <Button 
                  className="flex-1 flex-row items-center justify-center gap-1"
                  onPress={pickImage}
                >
                  <Images className='text-secondary' size={20} strokeWidth={1.25} />
                  <Text>Pick Image</Text>
                </Button>
              </View>

              <View className="rounded-lg p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base">Split between:</Text>
                  <View className="flex-row items-center space-x-6">
                    <Button
                      onPress={() => numPeople > 1 && setNumPeople(n => n - 1)}
                      variant="outline"
                      className="h-14 w-14 rounded-full bg-background border-2"
                    >
                      <Text className="text-2xl">-</Text>
                    </Button>
                    <Text className="text-2xl font-medium min-w-[32px] text-center">
                      {numPeople}
                    </Text>
                    <Button
                      onPress={() => setNumPeople(n => n + 1)}
                      variant="outline"
                      className="h-14 w-14 rounded-full bg-background border-2"
                    >
                      <Text className="text-2xl">+</Text>
                    </Button>
                  </View>
                </View>
              </View>

              <Button
                className="w-full h-14 sm:h-12"
                onPress={handleBillAnalysis}
                disabled={loading || !session}
              >
                <Text className="text-base">{loading ? 'Analyzing...' : 'Split it!'}</Text>
              </Button>
            </View>
          </CardContent>

          {result !== null && (
            <CardFooter className="border-t border-border mt-auto">
              <View className="w-full py-6 space-y-2">
                <Text className="text-base text-muted-foreground text-center">Each person pays:</Text>
                <Text className="text-3xl font-bold text-primary text-center">
                  ${result.toFixed(2)}
                </Text>
              </View>
            </CardFooter>
          )}
        </Card>
      </View>
    </ScrollView>
  );
} 