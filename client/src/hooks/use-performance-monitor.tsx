import { useState, useEffect, useCallback } from 'react';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  fps: number;
  cpuUsage: number;
  renderTime: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    memoryUsage: 0,
    fps: 60,
    cpuUsage: 0,
    renderTime: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  const measureResponseTime = useCallback(async (fn: () => Promise<any>) => {
    const start = window.performance.now();
    try {
      const result = await fn();
      const responseTime = window.performance.now() - start;
      setMetrics(prev => ({ ...prev, responseTime }));
      return result;
    } catch (error) {
      const responseTime = window.performance.now() - start;
      setMetrics(prev => ({ ...prev, responseTime }));
      throw error;
    }
  }, []);

  const measureRenderTime = useCallback((fn: () => void) => {
    const start = window.performance.now();
    fn();
    const renderTime = window.performance.now() - start;
    setMetrics(prev => ({ ...prev, renderTime }));
    return renderTime;
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);

    const monitorPerformance = () => {
      // Memory usage (approximation using performance.memory if available)
      if ('memory' in window.performance) {
        const memory = (window.performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }

      // FPS monitoring using requestAnimationFrame
      let frameCount = 0;
      let lastTime = window.performance.now();
      
      const countFrames = () => {
        frameCount++;
        const currentTime = window.performance.now();
        
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          setMetrics(prev => ({ ...prev, fps }));
          frameCount = 0;
          lastTime = currentTime;
        }
        
        if (isMonitoring) {
          requestAnimationFrame(countFrames);
        }
      };
      
      requestAnimationFrame(countFrames);
    };

    monitorPerformance();
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const getMetrics = useCallback(() => {
    return metrics;
  }, [metrics]);

  const isPerformanceGood = useCallback(() => {
    return (
      metrics.responseTime < 200 &&
      metrics.memoryUsage < 512 &&
      metrics.fps >= 55 &&
      metrics.renderTime < 16.67 // 60fps target
    );
  }, [metrics]);

  useEffect(() => {
    // Start monitoring by default
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    isMonitoring,
    measureResponseTime,
    measureRenderTime,
    startMonitoring,
    stopMonitoring,
    getMetrics,
    isPerformanceGood,
  };
}
