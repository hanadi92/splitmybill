import { useState } from 'react';
import { Item } from '~/components/ui/interactive/bill-result';
import { useAuth } from '~/lib/context/auth';
import { supabase } from '~/lib/services/supabase';

export interface UncleanedItem {
  name: string;
  price: string;
  quantity: string;
}

interface UseBillAnalysisResult {
  loading: boolean;
  result: number | null;
  setResult: (result: number | null) => void;
  analyzeBill: (imageUri: string, numPeople: number) => Promise<void>;
}

interface UseInteractiveBillAnalysisResult {
  loading: boolean;
  result: { total: number, items: Array<Item> } | null;
  setResult: (result: { total: number, items: Array<Item> } | null) => void;
  analyzeBill: (imageUri: string) => Promise<void>;
}

export function useBillAnalysis(): UseBillAnalysisResult {
  const { session, loading: authLoading, signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const analyzeBill = async (imageUri: string, numPeople: number) => {
    if (!imageUri) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // Sign in anonymously if not already signed in
      if (!session && !authLoading) {
        await signInAnonymously();
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-bill', {
        body: {
          imageUri,
          numPeople,
          interactive: false,
        },
      });

      if (error) throw error;

      if (!data?.analysis) {
        throw new Error('Invalid response format from server');
      }

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

  return {
    loading,
    result,
    setResult,
    analyzeBill,
  };
}

export function useInteractiveBillAnalysis(): UseInteractiveBillAnalysisResult {
  const { session, loading: authLoading, signInAnonymously } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number, items: Array<Item> } | null>(null);

  const analyzeBill = async (imageUri: string) => {
    if (!imageUri) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // Sign in anonymously if not already signed in
      if (!session && !authLoading) {
        await signInAnonymously();
      }

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-bill', {
        body: {
          imageUri,
          interactive: true,
        },
      });

      if (error) throw error;

      if (!data?.analysis) {
        throw new Error('Invalid response format from server');
      }

      const jsonMatch = data.analysis.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const json: { totalAmount: string, items: Array<UncleanedItem> } = JSON.parse(jsonMatch[0]);
      
      const cleanedItems: Item[] = json.items.map((item: UncleanedItem) => ({
        name: item.name,
        price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, '')) : item.price,
        quantity: typeof item.quantity === 'string' ? parseInt(item.quantity.replace(/[^0-9-]+/g, ''), 10) : item.quantity
      }));
      const cleanedTotal = typeof json.totalAmount === 'string'
        ? parseFloat(json.totalAmount.replace(/[^0-9.-]+/g, ''))
        : json.totalAmount;
 
      setResult({ total: cleanedTotal, items: cleanedItems });
    } catch (error) {
      console.error('Error analyzing bill:', error);
      alert('Error analyzing bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    setResult,
    analyzeBill,
  };
} 