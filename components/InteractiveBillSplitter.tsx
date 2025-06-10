import * as React from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { useAuth } from '~/lib/context/auth';
import { useImagePicker } from '~/lib/hooks/useImagePicker';
import { useInteractiveBillAnalysis } from '~/lib/hooks/useBillAnalysis';
import { BillSplitterUI } from './ui/interactive/bill-splitter-ui';
import { BillResult } from './ui/interactive/bill-result';
import { supabase } from '~/lib/services/supabase';
import * as Clipboard from 'expo-clipboard';
import { Card, CardContent } from './ui/card';
import { Copy } from '~/lib/icons/Copy';
import { ExternalLink } from 'lucide-react-native';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function InteractiveBillSplitter() {
  const { session, loading: authLoading, signInAnonymously } = useAuth();
  const { image, setImage, pickImage, takePhoto } = useImagePicker();
  const { loading, result, setResult, analyzeBill } = useInteractiveBillAnalysis();
  const [shareInfo, setShareInfo] = React.useState<{ billId: string; code: number } | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  // Scroll to end when sharing info is set
  React.useEffect(() => {
    if (shareInfo && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [shareInfo]);

  const handleBillAnalysis = async () => {
    if (image) {
      await analyzeBill(image);
    }
  };

  const handleSubmit = async () => {
    if (!result || !session) {
      return;
    }

    try {
      // First create a bill record
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
          total: result.total,
          owner_id: session.user.id,
          code: Math.floor(1000 + Math.random() * 9000)
        })
        .select()
        .single();

      if (billError) throw billError;

      // Then insert all bill items
      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(
          result.items.map(item => ({
            bill_id: bill.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        );

      if (itemsError) throw itemsError;

      // Store the sharing info
      setShareInfo({
        billId: bill.id,
        code: bill.code
      });
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    if (!shareInfo) return;
    
    const shareUrl = `${window.location.origin}/bills/${shareInfo.billId}?code=${shareInfo.code}`;
    await Clipboard.setStringAsync(shareUrl);
    alert('Link copied to clipboard!');
  };

  const renderShareInfo = () => {
    if (!shareInfo) return null;

    return (
      <Card className="mt-4 p-4">
        <CardContent className="space-y-4">
          <Text className="text-lg font-semibold text-center">Share this bill</Text>
          <Text className="text-center text-muted-foreground">
            Share this link with others to split the bill
          </Text>
          <View className="flex-row items-center justify-between bg-muted p-3 rounded-md">
            <Text className="flex-1 text-sm" numberOfLines={1}>
              {`${window.location.origin}/bills/${shareInfo.billId}?code=${shareInfo.code}`}
            </Text>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="ml-2" 
                onPress={handleCopyLink}
              >
                <Copy size={20} className="text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent insets={contentInsets}>
                <Text className='native:text-lg'>Copy link</Text>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button 
                    variant="outline" 
                    className="ml-2"
                    onPress={() => Linking.openURL(`${window.location.origin}/bills/${shareInfo.billId}?code=${shareInfo.code}`)}
                  >
                    <ExternalLink size={20} className="text-foreground" />
                  </Button>
              </TooltipTrigger>
              <TooltipContent insets={contentInsets}>
                <Text className='native:text-lg'>Open in browser</Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </CardContent>
      </Card>
    );
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
        setShareInfo(null);
      }}
      onAnalyze={handleBillAnalysis}
      onSubmit={handleSubmit}
      scrollViewRef={scrollViewRef}
      renderResult={() => (
        <View className="w-full">
          <BillResult 
            total={result?.total || 0} 
            items={result?.items || []}
            onSubmit={handleSubmit}
          />
          {renderShareInfo()}
        </View>
      )}
    />
  );
} 