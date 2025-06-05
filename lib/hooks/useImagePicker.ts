import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface UseImagePickerResult {
  image: string | null;
  setImage: (image: string | null) => void;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
}

export function useImagePicker(): UseImagePickerResult {
  const [image, setImage] = useState<string | null>(null);

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
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Error taking photo. Please try again.');
    }
  };

  return {
    image,
    setImage,
    pickImage,
    takePhoto,
  };
} 