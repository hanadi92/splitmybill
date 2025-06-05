import { useState } from 'react';
import { useAuth } from '~/lib/context/auth';
import { supabase } from '~/lib/services/supabase';

interface UseBillAnalysisResult {
  loading: boolean;
  result: number | null;
  setResult: (result: number | null) => void;
  analyzeBill: (imageUri: string, numPeople: number) => Promise<void>;
}

interface UseInteractiveBillAnalysisResult {
  loading: boolean;
  result: number | null;
  setResult: (result: number | null) => void;
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
  const [result, setResult] = useState<number | null>(null);

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

      // todo logic for interactive mode
      setResult(1.4);
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