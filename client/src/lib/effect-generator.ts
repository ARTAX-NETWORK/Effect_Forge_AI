import { aiEngine, type EffectDNA } from './ai-engine';
import { constitutionEngine } from './constitution-engine';

export interface EffectGenerationOptions {
  type: 'javascript' | 'css' | 'aftereffects';
  targetFps: number;
  maxMemory: number;
  enableConstitution: boolean;
  platform: 'web' | 'mobile' | 'desktop';
}

export interface GeneratedEffect {
  id: string;
  name: string;
  description: string;
  code: string;
  metadata: {
    renderTime: number;
    memoryUsage: number;
    fps: number;
    constitutionScore: number;
  };
  dna: EffectDNA;
}

class EffectGenerator {
  async generateFromPrompt(
    prompt: string, 
    options: EffectGenerationOptions
  ): Promise<GeneratedEffect> {
    // Phase 1: DÉCONSTRUIRE - Analyze the prompt
    const dna = await aiEngine.analyzeContent(prompt);
    
    // Phase 2: AMÉLIORER - Generate base effect
    let effect = await this.generateBaseEffect(prompt, dna, options);
    
    // Phase 3: AMPLIFIER - Optimize for performance
    effect = await this.optimizeEffect(effect, options);
    
    // Phase 4: RECONSTRUIRE - Apply constitutional compliance
    if (options.enableConstitution) {
      effect = await constitutionEngine.enforceCompliance(effect);
    }
    
    return effect;
  }

  async generateFromFile(
    parsedContent: string, 
    options: EffectGenerationOptions
  ): Promise<GeneratedEffect> {
    // Extract effect description from parsed content
    const prompt = this.extractEffectDescription(parsedContent);
    return this.generateFromPrompt(prompt, options);
  }

  private async generateBaseEffect(
    prompt: string, 
    dna: EffectDNA, 
    options: EffectGenerationOptions
  ): Promise<GeneratedEffect> {
    const templates = this.getEffectTemplates(options.type);
    const selectedTemplate = this.selectBestTemplate(dna, templates);
    
    const effect: GeneratedEffect = {
      id: this.generateId(),
      name: this.generateName(dna),
      description: prompt,
      code: this.generateCode(selectedTemplate, dna, options),
      metadata: {
        renderTime: 0,
        memoryUsage: 0,
        fps: options.targetFps,
        constitutionScore: 0,
      },
      dna,
    };

    return effect;
  }

  private async optimizeEffect(
    effect: GeneratedEffect, 
    options: EffectGenerationOptions
  ): Promise<GeneratedEffect> {
    // Performance optimization based on target constraints
    let optimizedCode = effect.code;
    
    // Memory optimization
    if (options.maxMemory < 512) {
      optimizedCode = this.optimizeMemoryUsage(optimizedCode);
    }
    
    // FPS optimization
    if (options.targetFps > 30) {
      optimizedCode = this.optimizeFrameRate(optimizedCode, options.targetFps);
    }
    
    // Platform-specific optimizations
    optimizedCode = this.optimizeForPlatform(optimizedCode, options.platform);
    
    return {
      ...effect,
      code: optimizedCode,
      metadata: {
        ...effect.metadata,
        renderTime: this.estimateRenderTime(optimizedCode),
        memoryUsage: this.estimateMemoryUsage(optimizedCode),
      },
    };
  }

  private getEffectTemplates(type: string): any[] {
    const templates = {
      javascript: [
        {
          name: 'ParticleSystem',
          category: 'particle',
          baseCode: this.getParticleTemplate(),
          performance: 0.8,
          compatibility: ['web', 'mobile'],
        },
        {
          name: 'CSSAnimation',
          category: 'animation',
          baseCode: this.getAnimationTemplate(),
          performance: 0.9,
          compatibility: ['web', 'mobile', 'desktop'],
        },
        {
          name: 'CanvasEffect',
          category: 'visual',
          baseCode: this.getCanvasTemplate(),
          performance: 0.7,
          compatibility: ['web', 'desktop'],
        },
      ],
      css: [
        {
          name: 'Transform3D',
          category: 'transform',
          baseCode: this.getTransformTemplate(),
          performance: 0.95,
          compatibility: ['web', 'mobile', 'desktop'],
        },
      ],
      aftereffects: [
        {
          name: 'Expression',
          category: 'expression',
          baseCode: this.getAETemplate(),
          performance: 0.8,
          compatibility: ['desktop'],
        },
      ],
    };
    
    return templates[type as keyof typeof templates] || templates.javascript;
  }

  private selectBestTemplate(dna: EffectDNA, templates: any[]): any {
    // Select template based on DNA analysis
    let bestTemplate = templates[0];
    let bestScore = 0;
    
    for (const template of templates) {
      const score = this.calculateTemplateScore(dna, template);
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }
    
    return bestTemplate;
  }

  private calculateTemplateScore(dna: EffectDNA, template: any): number {
    let score = 0;
    
    // Performance compatibility
    score += template.performance * 0.4;
    
    // Complexity matching
    const complexityMatch = 1 - Math.abs(template.complexity - dna.emotionalProfile.complexity);
    score += complexityMatch * 0.3;
    
    // Energy matching
    const energyMatch = 1 - Math.abs(template.energy - dna.emotionalProfile.energy);
    score += energyMatch * 0.3;
    
    return score;
  }

  private generateCode(template: any, dna: EffectDNA, options: EffectGenerationOptions): string {
    let code = template.baseCode;
    
    // Replace placeholders with DNA-specific values
    code = code.replace(/{{TARGET_FPS}}/g, options.targetFps.toString());
    code = code.replace(/{{MAX_MEMORY}}/g, options.maxMemory.toString());
    code = code.replace(/{{ENERGY}}/g, dna.emotionalProfile.energy.toString());
    code = code.replace(/{{COMPLEXITY}}/g, dna.emotionalProfile.complexity.toString());
    
    // Add constitutional compliance setup
    if (options.enableConstitution) {
      code = this.addConstitutionalSetup(code);
    }
    
    return code;
  }

  private addConstitutionalSetup(code: string): string {
    const constitutionalSetup = `
    // Constitutional Compliance Setup
    setupConstitutionalCompliance() {
      // Article I: Performance Absolue
      this.targetFPS = 60;
      this.frameTime = 16.67;
      this.performanceMonitor = new PerformanceMonitor();
      
      // Article II: Intelligence Adaptative
      this.autoCalibrate();
      this.setupAdaptiveParameters();
      
      // Article III: Polyvalence Universelle
      this.detectPlatform();
      this.setupCrossBrowserCompat();
    }`;
    
    return code.replace('// CONSTITUTIONAL_SETUP', constitutionalSetup);
  }

  private optimizeMemoryUsage(code: string): string {
    // Memory optimization techniques
    code = code.replace(/new Array\(\d+\)/g, '[]');
    code = code.replace(/setInterval/g, 'requestAnimationFrame');
    return code;
  }

  private optimizeFrameRate(code: string, targetFps: number): string {
    // FPS optimization techniques
    const frameTime = 1000 / targetFps;
    code = code.replace(/{{FRAME_TIME}}/g, frameTime.toString());
    return code;
  }

  private optimizeForPlatform(code: string, platform: string): string {
    switch (platform) {
      case 'mobile':
        return this.optimizeForMobile(code);
      case 'desktop':
        return this.optimizeForDesktop(code);
      default:
        return code;
    }
  }

  private optimizeForMobile(code: string): string {
    // Mobile-specific optimizations
    code = code.replace(/particleCount\s*=\s*\d+/g, 'particleCount = 50');
    return code;
  }

  private optimizeForDesktop(code: string): string {
    // Desktop-specific optimizations
    code = code.replace(/particleCount\s*=\s*\d+/g, 'particleCount = 200');
    return code;
  }

  private estimateRenderTime(code: string): number {
    // Estimate render time based on code complexity
    const complexity = code.length / 1000;
    return Math.round(complexity * 10 + Math.random() * 5);
  }

  private estimateMemoryUsage(code: string): number {
    // Estimate memory usage based on code analysis
    const particleCount = this.extractParticleCount(code);
    const baseMemory = 64;
    return Math.round(baseMemory + (particleCount * 0.1));
  }

  private extractParticleCount(code: string): number {
    const match = code.match(/particleCount\s*=\s*(\d+)/);
    return match ? parseInt(match[1]) : 100;
  }

  private extractEffectDescription(content: string): string {
    // Extract meaningful effect description from parsed content
    const lines = content.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).join(' ').substring(0, 200);
  }

  private generateId(): string {
    return 'effect_' + Math.random().toString(36).substr(2, 9);
  }

  private generateName(dna: EffectDNA): string {
    const concepts = dna.primaryConcepts.slice(0, 2);
    return concepts.join(' ') + ' Effect';
  }

  // Template definitions
  private getParticleTemplate(): string {
    return `
class {{EFFECT_NAME}} {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...this.getDefaults(), ...options };
    // CONSTITUTIONAL_SETUP
    this.init();
  }
  
  getDefaults() {
    return {
      particleCount: 100,
      speed: {{ENERGY}},
      complexity: {{COMPLEXITY}},
      targetFPS: {{TARGET_FPS}}
    };
  }
  
  init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.setupCanvas();
    this.createParticles();
    this.startAnimation();
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push(new Particle(this.canvas.width, this.canvas.height));
    }
  }
  
  render() {
    const start = performance.now();
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      particle.update();
      particle.draw(this.ctx);
    });
    
    const renderTime = performance.now() - start;
    if (renderTime > {{FRAME_TIME}}) {
      this.optimizeForNextFrame();
    }
    
    requestAnimationFrame(() => this.render());
  }
}`;
  }

  private getAnimationTemplate(): string {
    return `
.{{EFFECT_NAME}} {
  animation: effectAnimation {{ENERGY}}s infinite;
  transform-origin: center;
}

@keyframes effectAnimation {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale({{COMPLEXITY}}) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}`;
  }

  private getCanvasTemplate(): string {
    return `
class {{EFFECT_NAME}} {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // CONSTITUTIONAL_SETUP
    this.init();
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Effect rendering logic here
    const time = Date.now() * 0.001;
    const energy = {{ENERGY}};
    const complexity = {{COMPLEXITY}};
    
    this.drawEffect(time, energy, complexity);
    
    requestAnimationFrame(() => this.render());
  }
}`;
  }

  private getTransformTemplate(): string {
    return `
.{{EFFECT_NAME}} {
  transform: translateX({{ENERGY}}px) scale({{COMPLEXITY}});
  transition: all 0.3s ease;
}`;
  }

  private getAETemplate(): string {
    return `
// After Effects Expression for {{EFFECT_NAME}}
var energy = {{ENERGY}};
var complexity = {{COMPLEXITY}};
var time = thisComp.time;

// Constitutional Article I: Performance Absolue
if (frameRate < 60) {
  // Optimize for performance
}

transform.position + [Math.sin(time * energy) * 100, Math.cos(time * complexity) * 100];`;
  }
}

export const effectGenerator = new EffectGenerator();
