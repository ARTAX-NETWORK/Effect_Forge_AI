import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const effects = pgTable("effects", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(), // 'javascript', 'aftereffects', 'css'
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  
  // Code implementations
  javascriptCode: text("javascript_code"),
  cssCode: text("css_code"),
  afterEffectsCode: text("after_effects_code"),
  
  // Constitutional compliance
  constitutionScore: integer("constitution_score").notNull().default(0),
  performanceCompliant: boolean("performance_compliant").notNull().default(false),
  intelligenceAdaptive: boolean("intelligence_adaptive").notNull().default(false),
  universalCompatible: boolean("universal_compatible").notNull().default(false),
  perfectExperience: boolean("perfect_experience").notNull().default(false),
  visualImpact: boolean("visual_impact").notNull().default(false),
  addictiveEcosystem: boolean("addictive_ecosystem").notNull().default(false),
  competitiveDomination: boolean("competitive_domination").notNull().default(false),
  
  // Performance metrics
  renderTime: integer("render_time").notNull().default(0), // milliseconds
  memoryUsage: integer("memory_usage").notNull().default(0), // MB
  targetFps: integer("target_fps").notNull().default(60),
  
  // Metadata
  generatedBy: text("generated_by").notNull().default("AI"), // 'AI' or 'USER'
  generationPrompt: text("generation_prompt"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const files = pgTable("files", {
  id: varchar("id").primaryKey(),
  originalName: text("original_name").notNull(),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  parsedContent: text("parsed_content"),
  status: text("status").notNull().default("uploaded"), // 'uploaded', 'parsing', 'parsed', 'error'
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiSessions = pgTable("ai_sessions", {
  id: varchar("id").primaryKey(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  effectId: varchar("effect_id").references(() => effects.id),
  status: text("status").notNull().default("processing"), // 'processing', 'completed', 'error'
  processingTime: integer("processing_time").default(0), // milliseconds
  constitutionScore: integer("constitution_score").default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Performance metrics
  cpuUsage: integer("cpu_usage").notNull(), // percentage
  memoryUsage: integer("memory_usage").notNull(), // MB
  responseTime: integer("response_time").notNull(), // milliseconds
  
  // AI metrics
  neuralNetworkStatus: text("neural_network_status").notNull().default("online"),
  renderEngineStatus: text("render_engine_status").notNull().default("active"),
  effectLibraryStatus: text("effect_library_status").notNull().default("ready"),
  daarProcessorStatus: text("daar_processor_status").notNull().default("optimized"),
  
  // Constitution compliance
  totalEffects: integer("total_effects").notNull().default(0),
  compliantEffects: integer("compliant_effects").notNull().default(0),
  averageConstitutionScore: integer("average_constitution_score").notNull().default(0),
});

// Insert schemas
export const insertEffectSchema = createInsertSchema(effects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiSessionSchema = createInsertSchema(aiSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

// Types
export type Effect = typeof effects.$inferSelect;
export type InsertEffect = z.infer<typeof insertEffectSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type AiSession = typeof aiSessions.$inferSelect;
export type InsertAiSession = z.infer<typeof insertAiSessionSchema>;

export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;

// Effect generation request
export const effectGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  type: z.enum(["javascript", "aftereffects", "css", "all"]).default("javascript"),
  targetFps: z.number().min(30).max(120).default(60),
  maxMemory: z.number().min(64).max(1024).default(512), // MB
  enableConstitution: z.boolean().default(true),
});

export type EffectGenerationRequest = z.infer<typeof effectGenerationRequestSchema>;
