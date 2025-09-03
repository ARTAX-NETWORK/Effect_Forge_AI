import { randomUUID } from "crypto";
import { storage } from "../storage";
import type { InsertSystemMetrics, SystemMetrics } from "@shared/schema";
import * as os from "os";

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    neuralNetwork: 'online' | 'degraded' | 'offline';
    renderEngine: 'active' | 'slow' | 'error';
    effectLibrary: 'ready' | 'loading' | 'unavailable';
    daarProcessor: 'optimized' | 'normal' | 'overloaded';
  };
  uptime: number;
  lastCheck: Date;
}

export interface PerformanceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'response_time' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

class PerformanceMonitorService {
  private isMonitoring = false;
  private metrics: PerformanceMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    activeConnections: 0,
    requestsPerSecond: 0,
    errorRate: 0,
  };
  
  private alerts: PerformanceAlert[] = [];
  private requestTimings: number[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private lastRequestTime = Date.now();
  private connections = new Set<string>();

  private thresholds = {
    cpu: { warning: 70, critical: 85 },
    memory: { warning: 1024, critical: 1536 }, // MB
    responseTime: { warning: 200, critical: 500 }, // ms
    errorRate: { warning: 5, critical: 10 }, // percentage
  };

  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Performance Monitor started');
    
    // Start monitoring intervals
    this.startCPUMonitoring();
    this.startMemoryMonitoring();
    this.startMetricsCollection();
    this.startHealthChecks();
  }

  stop(): void {
    this.isMonitoring = false;
    console.log('Performance Monitor stopped');
  }

  // Track individual request performance
  trackRequest(duration: number): void {
    this.requestTimings.push(duration);
    this.requestCount++;
    
    // Keep only last 100 timings for average calculation
    if (this.requestTimings.length > 100) {
      this.requestTimings.shift();
    }

    // Update response time metric
    this.metrics.responseTime = this.calculateAverageResponseTime();
    
    // Check for performance alerts
    this.checkResponseTimeAlert(duration);
  }

  trackError(): void {
    this.errorCount++;
    this.updateErrorRate();
  }

  addConnection(connectionId: string): void {
    this.connections.add(connectionId);
    this.metrics.activeConnections = this.connections.size;
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
    this.metrics.activeConnections = this.connections.size;
  }

  async getCurrentMetrics(): Promise<SystemMetrics> {
    const currentTime = Date.now();
    
    // Calculate requests per second
    const timeSinceLastRequest = currentTime - this.lastRequestTime;
    this.metrics.requestsPerSecond = timeSinceLastRequest > 0 
      ? Math.round((this.requestCount * 1000) / Math.max(timeSinceLastRequest, 1000))
      : 0;

    // Create system metrics record
    const systemMetrics: InsertSystemMetrics = {
      cpuUsage: Math.round(this.metrics.cpuUsage),
      memoryUsage: Math.round(this.metrics.memoryUsage),
      responseTime: Math.round(this.metrics.responseTime),
      neuralNetworkStatus: this.getNeuralNetworkStatus(),
      renderEngineStatus: this.getRenderEngineStatus(),
      effectLibraryStatus: this.getEffectLibraryStatus(),
      daarProcessorStatus: this.getDaarProcessorStatus(),
      totalEffects: await this.getTotalEffectsCount(),
      compliantEffects: await this.getCompliantEffectsCount(),
      averageConstitutionScore: await this.getAverageConstitutionScore(),
    };

    // Store metrics in database
    const storedMetrics = await storage.createSystemMetrics(systemMetrics);
    
    return storedMetrics;
  }

  async getHealthStatus(): Promise<SystemHealth> {
    const health: SystemHealth = {
      overall: this.calculateOverallHealth(),
      services: {
        neuralNetwork: this.getNeuralNetworkStatus() as any,
        renderEngine: this.getRenderEngineStatus() as any,
        effectLibrary: this.getEffectLibraryStatus() as any,
        daarProcessor: this.getDaarProcessorStatus() as any,
      },
      uptime: process.uptime(),
      lastCheck: new Date(),
    };

    return health;
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  getPerformanceHistory(hours: number = 24): Promise<SystemMetrics[]> {
    return storage.getSystemMetricsHistory(hours);
  }

  // Private monitoring methods
  private startCPUMonitoring(): void {
    const startUsage = process.cpuUsage();
    
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      const currentUsage = process.cpuUsage(startUsage);
      const cpuPercent = ((currentUsage.user + currentUsage.system) / 1000000) / os.cpus().length * 100;
      
      this.metrics.cpuUsage = Math.min(100, cpuPercent);
      this.checkCPUAlert();
    }, 5000); // Check every 5 seconds
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      const usage = process.memoryUsage();
      this.metrics.memoryUsage = Math.round(usage.heapUsed / 1024 / 1024); // Convert to MB
      
      this.checkMemoryAlert();
    }, 5000); // Check every 5 seconds
  }

  private startMetricsCollection(): void {
    setInterval(async () => {
      if (!this.isMonitoring) return;
      
      // Store current metrics
      await this.getCurrentMetrics();
      
      // Reset counters for next period
      this.resetCounters();
    }, 60000); // Collect every minute
  }

  private startHealthChecks(): void {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  private calculateAverageResponseTime(): number {
    if (this.requestTimings.length === 0) return 0;
    
    const sum = this.requestTimings.reduce((acc, time) => acc + time, 0);
    return sum / this.requestTimings.length;
  }

  private updateErrorRate(): void {
    if (this.requestCount === 0) {
      this.metrics.errorRate = 0;
    } else {
      this.metrics.errorRate = (this.errorCount / this.requestCount) * 100;
    }
    
    this.checkErrorRateAlert();
  }

  private resetCounters(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastRequestTime = Date.now();
  }

  // Alert checking methods
  private checkCPUAlert(): void {
    const cpu = this.metrics.cpuUsage;
    
    if (cpu >= this.thresholds.cpu.critical) {
      this.createAlert('cpu', 'critical', `Critical CPU usage: ${cpu.toFixed(1)}%`);
    } else if (cpu >= this.thresholds.cpu.warning) {
      this.createAlert('cpu', 'high', `High CPU usage: ${cpu.toFixed(1)}%`);
    }
  }

  private checkMemoryAlert(): void {
    const memory = this.metrics.memoryUsage;
    
    if (memory >= this.thresholds.memory.critical) {
      this.createAlert('memory', 'critical', `Critical memory usage: ${memory}MB`);
    } else if (memory >= this.thresholds.memory.warning) {
      this.createAlert('memory', 'high', `High memory usage: ${memory}MB`);
    }
  }

  private checkResponseTimeAlert(duration: number): void {
    if (duration >= this.thresholds.responseTime.critical) {
      this.createAlert('response_time', 'critical', `Critical response time: ${duration}ms`);
    } else if (duration >= this.thresholds.responseTime.warning) {
      this.createAlert('response_time', 'medium', `Slow response time: ${duration}ms`);
    }
  }

  private checkErrorRateAlert(): void {
    const errorRate = this.metrics.errorRate;
    
    if (errorRate >= this.thresholds.errorRate.critical) {
      this.createAlert('error_rate', 'critical', `Critical error rate: ${errorRate.toFixed(1)}%`);
    } else if (errorRate >= this.thresholds.errorRate.warning) {
      this.createAlert('error_rate', 'high', `High error rate: ${errorRate.toFixed(1)}%`);
    }
  }

  private createAlert(type: PerformanceAlert['type'], severity: PerformanceAlert['severity'], message: string): void {
    // Check if similar alert already exists and is unresolved
    const existingAlert = this.alerts.find(
      alert => alert.type === type && alert.severity === severity && !alert.resolved
    );
    
    if (existingAlert) return; // Don't create duplicate alerts
    
    const alert: PerformanceAlert = {
      id: randomUUID(),
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    console.warn(`Performance Alert [${severity.toUpperCase()}]: ${message}`);
  }

  private calculateOverallHealth(): 'healthy' | 'warning' | 'critical' {
    const criticalAlerts = this.getActiveAlerts().filter(a => a.severity === 'critical');
    const highAlerts = this.getActiveAlerts().filter(a => a.severity === 'high');
    
    if (criticalAlerts.length > 0) return 'critical';
    if (highAlerts.length > 2) return 'warning';
    
    // Check individual metrics
    if (this.metrics.cpuUsage > this.thresholds.cpu.critical ||
        this.metrics.memoryUsage > this.thresholds.memory.critical ||
        this.metrics.responseTime > this.thresholds.responseTime.critical ||
        this.metrics.errorRate > this.thresholds.errorRate.critical) {
      return 'critical';
    }
    
    if (this.metrics.cpuUsage > this.thresholds.cpu.warning ||
        this.metrics.memoryUsage > this.thresholds.memory.warning ||
        this.metrics.responseTime > this.thresholds.responseTime.warning ||
        this.metrics.errorRate > this.thresholds.errorRate.warning) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private getNeuralNetworkStatus(): string {
    // Check if AI engine is responding properly
    if (this.metrics.responseTime > 1000) return 'degraded';
    if (this.metrics.errorRate > 10) return 'offline';
    return 'online';
  }

  private getRenderEngineStatus(): string {
    // Check render performance
    if (this.metrics.responseTime > 500) return 'slow';
    if (this.metrics.errorRate > 5) return 'error';
    return 'active';
  }

  private getEffectLibraryStatus(): string {
    // Check library accessibility
    if (this.metrics.errorRate > 15) return 'unavailable';
    if (this.metrics.responseTime > 200) return 'loading';
    return 'ready';
  }

  private getDaarProcessorStatus(): string {
    // Check DAAR processor performance
    if (this.metrics.cpuUsage > 80) return 'overloaded';
    if (this.metrics.cpuUsage > 60) return 'normal';
    return 'optimized';
  }

  private async getTotalEffectsCount(): Promise<number> {
    try {
      const effects = await storage.getEffects();
      return effects.length;
    } catch {
      return 0;
    }
  }

  private async getCompliantEffectsCount(): Promise<number> {
    try {
      const effects = await storage.getEffects();
      return effects.filter(effect => effect.constitutionScore >= 90).length;
    } catch {
      return 0;
    }
  }

  private async getAverageConstitutionScore(): Promise<number> {
    try {
      const effects = await storage.getEffects();
      if (effects.length === 0) return 0;
      
      const totalScore = effects.reduce((sum, effect) => sum + effect.constitutionScore, 0);
      return Math.round(totalScore / effects.length);
    } catch {
      return 0;
    }
  }

  private performHealthChecks(): void {
    // Perform various health checks
    this.checkDiskSpace();
    this.checkNetworkConnectivity();
    this.checkDatabaseConnectivity();
  }

  private checkDiskSpace(): void {
    // In a real implementation, you would check actual disk space
    // For now, simulate the check
    const freeSpaceGB = 50; // Simulated free space
    
    if (freeSpaceGB < 1) {
      this.createAlert('memory', 'critical', `Critical disk space: ${freeSpaceGB}GB remaining`);
    } else if (freeSpaceGB < 5) {
      this.createAlert('memory', 'high', `Low disk space: ${freeSpaceGB}GB remaining`);
    }
  }

  private checkNetworkConnectivity(): void {
    // Simulate network connectivity check
    const networkLatency = Math.random() * 100; // Simulated latency
    
    if (networkLatency > 200) {
      this.createAlert('response_time', 'medium', `High network latency: ${networkLatency.toFixed(0)}ms`);
    }
  }

  private checkDatabaseConnectivity(): void {
    // Test database operations
    storage.getLatestSystemMetrics()
      .then(() => {
        // Database is responsive
      })
      .catch(() => {
        this.createAlert('error_rate', 'critical', 'Database connectivity issues detected');
      });
  }

  // Express middleware for automatic request tracking
  getMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const connectionId = randomUUID();
      
      this.addConnection(connectionId);
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.trackRequest(duration);
        
        if (res.statusCode >= 400) {
          this.trackError();
        }
        
        this.removeConnection(connectionId);
      });
      
      next();
    };
  }
}

export const performanceMonitor = new PerformanceMonitorService();
