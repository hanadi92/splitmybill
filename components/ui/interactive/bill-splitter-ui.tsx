import * as React from 'react';
import { View, Animated } from 'react-native';
import { Button } from '../button';
import { Text } from '../text';
import { Card, CardContent, CardFooter, CardHeader } from '../card';
import { BillHeader } from '../bill-header';
import { BillImagePicker } from '../bill-image-picker';
import { PeopleCounter } from '../people-counter';
import { BillResult, Item } from '../interactive/bill-result';
import ScrollView = Animated.ScrollView;

interface BillSplitterUIProps {
  title: string;
  image: string | null;
  numPeople?: number;
  loading: boolean;
  result: { total: number, items: Array<Item> } | null;
  onImagePick: () => Promise<void>;
  onPhotoTake: () => Promise<void>;
  onImageClear: () => void;
  onNumPeopleChange?: (change: -1 | 1) => void;
  onAnalyze: () => Promise<void>;
  renderResult?: () => React.ReactNode;
}

export function BillSplitterUI({
  title,
  image,
  numPeople,
  loading,
  result,
  onImagePick,
  onPhotoTake,
  onImageClear,
  onNumPeopleChange,
  onAnalyze,
  renderResult,
}: BillSplitterUIProps) {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 container mx-auto px-4 py-6 min-h-screen items-center justify-center">
        <Card className="w-full max-w-md web:shadow-xl web:dark:shadow-foreground">
          <CardHeader>
            <BillHeader title={title} />
          </CardHeader>

          <CardContent className="flex-1 gap-4">
            <BillImagePicker
              image={image}
              onImagePick={onImagePick}
              onPhotoTake={onPhotoTake}
              onImageClear={onImageClear}
            />

            <View className="gap-4">
              {numPeople && onNumPeopleChange && <PeopleCounter
                value={numPeople}
                onChange={onNumPeopleChange}
              />}

              <Button
                className="w-full h-14 sm:h-12"
                onPress={onAnalyze}
                disabled={loading}
              >
                <Text className="text-base">{loading ? 'Analyzing...' : 'Split it!'}</Text>
              </Button>
            </View>
          </CardContent>

          {result !== null && (
            <CardFooter className="border-t border-border mt-auto">
              {renderResult ? renderResult() : (
                <BillResult total={result.total} items={result.items} />
              )}
            </CardFooter>
          )}
        </Card>
      </View>
    </ScrollView>
  );
} 