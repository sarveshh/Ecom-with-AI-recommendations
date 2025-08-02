import mongoose from 'mongoose';

export interface IAnalyticsEvent {
  _id: string;
  userId: string;
  event: string;
  productId?: string;
  category?: string;
  value?: number;
  metadata: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
}

const analyticsEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  event: { type: String, required: true, index: true },
  productId: { type: String, index: true },
  category: { type: String, index: true },
  value: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
  sessionId: { type: String, required: true, index: true },
  userAgent: { type: String },
  ipAddress: { type: String }
}, {
  timestamps: true
});

// Compound indexes for efficient analytics queries
analyticsEventSchema.index({ event: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ productId: 1, event: 1, timestamp: -1 });

export default mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
