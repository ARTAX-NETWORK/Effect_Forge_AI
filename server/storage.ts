import { 
  type Effect, 
  type InsertEffect,
  type File, 
  type InsertFile,
  type AiSession, 
  type InsertAiSession,
  type SystemMetrics, 
  type InsertSystemMetrics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Effects
  getEffect(id: string): Promise<Effect | undefined>;
  getEffects(filters?: { search?: string; category?: string; type?: string }): Promise<Effect[]>;
  createEffect(effect: InsertEffect): Promise<Effect>;
  updateEffect(id: string, updates: Partial<InsertEffect>): Promise<Effect>;
  deleteEffect(id: string): Promise<void>;

  // Files
  getFile(id: string): Promise<File | undefined>;
  getFiles(): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<InsertFile>): Promise<File>;
  deleteFile(id: string): Promise<void>;

  // AI Sessions
  getAiSession(id: string): Promise<AiSession | undefined>;
  getRecentAiSessions(limit: number): Promise<AiSession[]>;
  createAiSession(session: InsertAiSession): Promise<AiSession>;
  updateAiSession(id: string, updates: Partial<Omit<InsertAiSession, 'id'> & { completedAt?: Date }>): Promise<AiSession>;

  // System Metrics
  getLatestSystemMetrics(): Promise<SystemMetrics | undefined>;
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  getSystemMetricsHistory(hours: number): Promise<SystemMetrics[]>;
}

export class MemStorage implements IStorage {
  private effects: Map<string, Effect> = new Map();
  private files: Map<string, File> = new Map();
  private aiSessions: Map<string, AiSession> = new Map();
  private systemMetrics: Map<string, SystemMetrics> = new Map();

  constructor() {
    // Initialize with some sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample effects for testing
    const sampleEffect: Effect = {
      id: randomUUID(),
      name: "Plasma Explosion",
      description: "A high-energy plasma explosion effect with constitutional compliance",
      category: "particle",
      type: "javascript",
      tags: ["explosion", "plasma", "energy"],
      javascriptCode: "class PlasmaExplosion { /* constitutional code */ }",
      cssCode: null,
      afterEffectsCode: null,
      constitutionScore: 98,
      performanceCompliant: true,
      intelligenceAdaptive: true,
      universalCompatible: true,
      perfectExperience: true,
      visualImpact: true,
      addictiveEcosystem: true,
      competitiveDomination: true,
      renderTime: 12,
      memoryUsage: 256,
      targetFps: 60,
      generatedBy: "AI",
      generationPrompt: "Create a spectacular plasma explosion effect",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.effects.set(sampleEffect.id, sampleEffect);
  }

  // Effects
  async getEffect(id: string): Promise<Effect | undefined> {
    return this.effects.get(id);
  }

  async getEffects(filters?: { search?: string; category?: string; type?: string }): Promise<Effect[]> {
    let effects = Array.from(this.effects.values());

    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        effects = effects.filter(effect => 
          effect.name.toLowerCase().includes(search) ||
          effect.description.toLowerCase().includes(search) ||
          effect.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }

      if (filters.category && filters.category !== 'all') {
        effects = effects.filter(effect => effect.category === filters.category);
      }

      if (filters.type && filters.type !== 'all') {
        effects = effects.filter(effect => effect.type === filters.type);
      }
    }

    return effects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createEffect(insertEffect: InsertEffect): Promise<Effect> {
    const id = randomUUID();
    const now = new Date();
    
    const effect: Effect = {
      ...insertEffect,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.effects.set(id, effect);
    return effect;
  }

  async updateEffect(id: string, updates: Partial<InsertEffect>): Promise<Effect> {
    const existingEffect = this.effects.get(id);
    if (!existingEffect) {
      throw new Error('Effect not found');
    }

    const updatedEffect: Effect = {
      ...existingEffect,
      ...updates,
      updatedAt: new Date(),
    };

    this.effects.set(id, updatedEffect);
    return updatedEffect;
  }

  async deleteEffect(id: string): Promise<void> {
    if (!this.effects.has(id)) {
      throw new Error('Effect not found');
    }
    this.effects.delete(id);
  }

  // Files
  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFiles(): Promise<File[]> {
    return Array.from(this.files.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const now = new Date();
    
    const file: File = {
      ...insertFile,
      id,
      status: insertFile.status || 'uploaded',
      createdAt: now,
      updatedAt: now,
    };

    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<InsertFile>): Promise<File> {
    const existingFile = this.files.get(id);
    if (!existingFile) {
      throw new Error('File not found');
    }

    const updatedFile: File = {
      ...existingFile,
      ...updates,
      updatedAt: new Date(),
    };

    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.files.has(id)) {
      throw new Error('File not found');
    }
    this.files.delete(id);
  }

  // AI Sessions
  async getAiSession(id: string): Promise<AiSession | undefined> {
    return this.aiSessions.get(id);
  }

  async getRecentAiSessions(limit: number): Promise<AiSession[]> {
    return Array.from(this.aiSessions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAiSession(insertSession: InsertAiSession): Promise<AiSession> {
    const id = randomUUID();
    const now = new Date();
    
    const session: AiSession = {
      ...insertSession,
      id,
      status: insertSession.status || 'processing',
      createdAt: now,
      completedAt: null,
    };

    this.aiSessions.set(id, session);
    return session;
  }

  async updateAiSession(id: string, updates: Partial<Omit<InsertAiSession, 'id'> & { completedAt?: Date }>): Promise<AiSession> {
    const existingSession = this.aiSessions.get(id);
    if (!existingSession) {
      throw new Error('AI Session not found');
    }

    const updatedSession: AiSession = {
      ...existingSession,
      ...updates,
    };

    this.aiSessions.set(id, updatedSession);
    return updatedSession;
  }

  // System Metrics
  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    const metrics = Array.from(this.systemMetrics.values());
    if (metrics.length === 0) return undefined;
    
    return metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async createSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = randomUUID();
    const now = new Date();
    
    const metrics: SystemMetrics = {
      ...insertMetrics,
      id,
      timestamp: now,
      neuralNetworkStatus: insertMetrics.neuralNetworkStatus || 'online',
      renderEngineStatus: insertMetrics.renderEngineStatus || 'active',
      effectLibraryStatus: insertMetrics.effectLibraryStatus || 'ready',
      daarProcessorStatus: insertMetrics.daarProcessorStatus || 'optimized',
      totalEffects: insertMetrics.totalEffects || 0,
      compliantEffects: insertMetrics.compliantEffects || 0,
      averageConstitutionScore: insertMetrics.averageConstitutionScore || 0,
    };

    this.systemMetrics.set(id, metrics);
    
    // Keep only last 1000 entries
    const allMetrics = Array.from(this.systemMetrics.entries());
    if (allMetrics.length > 1000) {
      const sorted = allMetrics.sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime());
      const toDelete = sorted.slice(1000);
      toDelete.forEach(([key]) => this.systemMetrics.delete(key));
    }

    return metrics;
  }

  async getSystemMetricsHistory(hours: number): Promise<SystemMetrics[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return Array.from(this.systemMetrics.values())
      .filter(metrics => metrics.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
