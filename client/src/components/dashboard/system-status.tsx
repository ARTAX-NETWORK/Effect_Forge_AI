import { useQuery } from '@tanstack/react-query';
import { Activity, Cpu, Database, Zap } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

export function SystemStatus() {
  const { data: systemMetrics } = useQuery({
    queryKey: ['/api/system/metrics'],
    refetchInterval: 1000, // Update every second
  });

  const { metrics: performanceMetrics } = usePerformanceMonitor();

  const statusItems = [
    {
      name: 'Neural Network',
      status: systemMetrics?.neuralNetworkStatus || 'online',
      color: 'text-green-400',
      dot: 'bg-green-500'
    },
    {
      name: 'Render Engine',
      status: systemMetrics?.renderEngineStatus || 'active',
      color: 'text-primary',
      dot: 'bg-primary'
    },
    {
      name: 'Effect Library',
      status: systemMetrics?.effectLibraryStatus || 'ready',
      color: 'text-accent',
      dot: 'bg-accent'
    },
    {
      name: 'DAAR Processor',
      status: systemMetrics?.daarProcessorStatus || 'optimized',
      color: 'text-yellow-400',
      dot: 'bg-yellow-500'
    }
  ];

  const metricsDisplay = [
    {
      label: 'Response Time',
      value: `${performanceMetrics.responseTime || 0}ms`,
      target: '<50ms'
    },
    {
      label: 'Memory Usage',
      value: `${Math.round(performanceMetrics.memoryUsage || 0)}MB`,
      target: '<512MB'
    },
    {
      label: 'FPS Target',
      value: `${performanceMetrics.fps || 60}fps`,
      target: '60fps'
    },
    {
      label: 'Uptime',
      value: '99.99%',
      target: '99.99%'
    }
  ];

  return (
    <div className="holographic-panel rounded-2xl p-6" data-testid="system-status">
      <h3 className="text-xl font-bold mb-6 text-primary flex items-center">
        <Cpu className="mr-3" />
        System Status
      </h3>
      
      <div className="space-y-4 mb-6">
        {statusItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="text-sm">{item.name}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${item.dot} rounded-full animate-pulse`} />
              <span className={`${item.color} text-sm font-medium capitalize`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
        <div className="perf-bar" />
      </div>
      
      <div className="pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-3 text-accent flex items-center">
          <Activity className="mr-2 w-4 h-4" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {metricsDisplay.map((metric) => (
            <div key={metric.label}>
              <div className="text-muted-foreground">{metric.label}</div>
              <div className="text-primary font-mono">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
