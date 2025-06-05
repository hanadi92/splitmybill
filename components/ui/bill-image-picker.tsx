import * as React from 'react';
import { View, Image, Pressable } from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { Camera } from '~/lib/icons/Camera';
import { Images } from '~/lib/icons/Images';
import { Trash2 } from '~/lib/icons/Trash';

interface BillImagePickerProps {
  image: string | null;
  onImagePick: () => Promise<void>;
  onPhotoTake: () => Promise<void>;
  onImageClear: () => void;
}

export function BillImagePicker({
  image,
  onImagePick,
  onPhotoTake,
  onImageClear,
}: BillImagePickerProps) {
  return (
    <View className="gap-4">
      <Pressable 
        onPress={onImagePick}
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
              onPress={onImageClear}
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

      <View className="flex-row justify-between gap-4">
        <Button 
          className="flex-1 flex-row items-center justify-center gap-1"
          onPress={onPhotoTake}
        >
          <Camera className='text-secondary' size={20} strokeWidth={1.25} />
          <Text>Take Photo</Text>
        </Button>
        <Button 
          className="flex-1 flex-row items-center justify-center gap-1"
          onPress={onImagePick}
        >
          <Images className='text-secondary' size={20} strokeWidth={1.25} />
          <Text>Pick Image</Text>
        </Button>
      </View>
    </View>
  );
} 