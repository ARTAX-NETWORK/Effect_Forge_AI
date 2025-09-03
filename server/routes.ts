import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { aiEngine } from "./services/ai-engine";
import { fileParser } from "./services/file-parser";
import { effectGenerator } from "./services/effect-generator";
import { constitutionValidator } from "./services/constitution-validator";
import { performanceMonitor } from "./services/performance-monitor";
import { effectGenerationRequestSchema } from "@shared/schema";
import multer from "multer";
import { randomUUID } from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/rtf',
      'application/xml',
      'text/xml'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  await aiEngine.initialize();
  performanceMonitor.start();

  // AI Engine Routes
  app.post('/api/ai/initialize', async (req, res) => {
    try {
      await aiEngine.initialize();
      res.json({ success: true, message: 'AI Engine initialized' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const analysis = await aiEngine.analyzeContent(content);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
    }
  });

  app.post('/api/ai/optimize', async (req, res) => {
    try {
      const { code, target } = req.body;
      if (!code || !target) {
        return res.status(400).json({ error: 'Code and target are required' });
      }

      const optimizedCode = await aiEngine.optimizeCode(code, target);
      res.json({ optimizedCode });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Optimization failed' });
    }
  });

  app.post('/api/ai/shutdown', async (req, res) => {
    try {
      await aiEngine.shutdown();
      res.json({ success: true, message: 'AI Engine shutdown' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Shutdown failed' });
    }
  });

  // Effect Generation Routes
  app.post('/api/effects/generate', async (req, res) => {
    try {
      const validatedData = effectGenerationRequestSchema.parse(req.body);
      
      const sessionId = randomUUID();
      
      // Create AI session
      const session = await storage.createAiSession({
        prompt: validatedData.prompt,
        status: 'processing',
      });

      // Start effect generation asynchronously
      generateEffectAsync(sessionId, validatedData).catch(console.error);

      res.json({ 
        sessionId,
        message: 'Effect generation started',
        estimatedTime: '30-60 seconds'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
    }
  });

  async function generateEffectAsync(sessionId: string, request: any) {
    const startTime = Date.now();
    
    try {
      // Generate effect using DAAR methodology
      const effect = await effectGenerator.generateEffect(request);
      
      // Apply constitutional validation if enabled
      if (request.enableConstitution) {
        const validatedEffect = await constitutionValidator.validateAndEnforce(effect);
        effect.constitutionScore = validatedEffect.constitutionScore;
        effect.performanceCompliant = validatedEffect.performanceCompliant;
        effect.intelligenceAdaptive = validatedEffect.intelligenceAdaptive;
        effect.universalCompatible = validatedEffect.universalCompatible;
        effect.perfectExperience = validatedEffect.perfectExperience;
        effect.visualImpact = validatedEffect.visualImpact;
        effect.addictiveEcosystem = validatedEffect.addictiveEcosystem;
        effect.competitiveDomination = validatedEffect.competitiveDomination;
      }

      // Save effect to storage
      const savedEffect = await storage.createEffect(effect);
      
      // Update session with completion
      await storage.updateAiSession(sessionId, {
        response: JSON.stringify(savedEffect),
        effectId: savedEffect.id,
        status: 'completed',
        processingTime: Date.now() - startTime,
        constitutionScore: effect.constitutionScore,
        completedAt: new Date(),
      });

    } catch (error) {
      // Update session with error
      await storage.updateAiSession(sessionId, {
        status: 'error',
        response: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      });
    }
  }

  app.get('/api/effects', async (req, res) => {
    try {
      const { search, category, type } = req.query;
      const effects = await storage.getEffects({
        search: search as string,
        category: category as string,
        type: type as string,
      });
      res.json(effects);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch effects' });
    }
  });

  app.get('/api/effects/:id', async (req, res) => {
    try {
      const effect = await storage.getEffect(req.params.id);
      if (!effect) {
        return res.status(404).json({ error: 'Effect not found' });
      }
      res.json(effect);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch effect' });
    }
  });

  app.delete('/api/effects/:id', async (req, res) => {
    try {
      await storage.deleteEffect(req.params.id);
      res.json({ success: true, message: 'Effect deleted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete effect' });
    }
  });

  // File Upload and Parsing Routes
  app.post('/api/files/upload', upload.array('files'), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const tempId = randomUUID();
        const filename = `${tempId}_${file.originalname}`;

        // Save file metadata
        const savedFile = await storage.createFile({
          originalName: file.originalname,
          filename,
          mimetype: file.mimetype,
          size: file.size,
          status: 'uploaded',
        });

        uploadedFiles.push(savedFile);

        // Start parsing asynchronously
        parseFileAsync(savedFile.id, file).catch(console.error);
      }

      res.json({ 
        success: true,
        files: uploadedFiles,
        message: `${uploadedFiles.length} files uploaded successfully`
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
    }
  });

  async function parseFileAsync(fileId: string, file: Express.Multer.File) {
    try {
      // Update status to parsing
      await storage.updateFile(fileId, { status: 'parsing' });

      // Parse file content
      const parsedContent = await fileParser.parseFile(file);

      // Update with parsed content
      await storage.updateFile(fileId, {
        status: 'parsed',
        parsedContent,
      });

    } catch (error) {
      // Update with error
      await storage.updateFile(fileId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown parsing error',
      });
    }
  }

  app.get('/api/files', async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch files' });
    }
  });

  app.delete('/api/files/:id', async (req, res) => {
    try {
      await storage.deleteFile(req.params.id);
      res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete file' });
    }
  });

  // AI Session Routes
  app.get('/api/sessions/recent', async (req, res) => {
    try {
      const sessions = await storage.getRecentAiSessions(10);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch sessions' });
    }
  });

  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const session = await storage.getAiSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch session' });
    }
  });

  // System Metrics Routes
  app.get('/api/system/metrics', async (req, res) => {
    try {
      const metrics = await performanceMonitor.getCurrentMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch metrics' });
    }
  });

  app.get('/api/system/health', async (req, res) => {
    try {
      const health = await performanceMonitor.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch health status' });
    }
  });

  // Constitutional Compliance Routes
  app.post('/api/constitution/validate', async (req, res) => {
    try {
      const { effectId } = req.body;
      if (!effectId) {
        return res.status(400).json({ error: 'Effect ID is required' });
      }

      const effect = await storage.getEffect(effectId);
      if (!effect) {
        return res.status(404).json({ error: 'Effect not found' });
      }

      const compliance = await constitutionValidator.validateCompliance(effect);
      res.json(compliance);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Validation failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
