import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiEngine } from '@/lib/ai-engine';
import { useToast } from '@/hooks/use-toast';

export interface AIEngineState {
  isInitialized: boolean;
  isProcessing: boolean;
  lastResult: any | null;
  error: string | null;
}

export function useAiEngine() {
  const [state, setState] = useState<AIEngineState>({
    isInitialized: false,
    isProcessing: false,
    lastResult: null,
    error: null,
  });
  
  const { toast } = useToast();

  const initializeMutation = useMutation({
    mutationFn: async () => {
      return aiEngine.initialize();
    },
    onSuccess: () => {
      setState(prev => ({ ...prev, isInitialized: true, error: null }));
      toast({
        title: 'AI Engine Ready',
        description: 'Neural core initialized successfully',
      });
    },
    onError: (error) => {
      setState(prev => ({ ...prev, error: error.message }));
      toast({
        title: 'AI Engine Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateEffectMutation = useMutation({
    mutationFn: async (prompt: string) => {
      setState(prev => ({ ...prev, isProcessing: true }));
      return aiEngine.generateEffect(prompt);
    },
    onSuccess: (result) => {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        lastResult: result,
        error: null 
      }));
    },
    onError: (error) => {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error.message 
      }));
    },
  });

  const analyzeContentMutation = useMutation({
    mutationFn: async (content: string) => {
      setState(prev => ({ ...prev, isProcessing: true }));
      return aiEngine.analyzeContent(content);
    },
    onSuccess: (result) => {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        lastResult: result,
        error: null 
      }));
    },
    onError: (error) => {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error.message 
      }));
    },
  });

  const initialize = useCallback(() => {
    if (!state.isInitialized && !initializeMutation.isPending) {
      initializeMutation.mutate();
    }
  }, [state.isInitialized, initializeMutation]);

  const generateEffect = useCallback((prompt: string) => {
    if (state.isInitialized) {
      generateEffectMutation.mutate(prompt);
    } else {
      toast({
        title: 'AI Engine Not Ready',
        description: 'Please initialize the AI engine first',
        variant: 'destructive',
      });
    }
  }, [state.isInitialized, generateEffectMutation, toast]);

  const analyzeContent = useCallback((content: string) => {
    if (state.isInitialized) {
      analyzeContentMutation.mutate(content);
    } else {
      toast({
        title: 'AI Engine Not Ready',
        description: 'Please initialize the AI engine first',
        variant: 'destructive',
      });
    }
  }, [state.isInitialized, analyzeContentMutation, toast]);

  const getPerformanceMetrics = useCallback(() => {
    return aiEngine.getMetrics();
  }, []);

  return {
    ...state,
    initialize,
    generateEffect,
    analyzeContent,
    getPerformanceMetrics,
    isInitializing: initializeMutation.isPending,
  };
}
