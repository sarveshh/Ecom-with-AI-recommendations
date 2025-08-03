import mongoose from 'mongoose';

const emailSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['newsletter', 'checkout', 'popup', 'manual'],
    default: 'newsletter'
  },
  tags: [{
    type: String,
    trim: true
  }],
  preferences: {
    newsletter: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: false },
    unsubscribed: { type: Boolean, default: false }
  },
  metadata: {
    signupDate: { type: Date, default: Date.now },
    lastEngagement: Date,
    totalPurchases: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
emailSubscriberSchema.index({ email: 1 });
emailSubscriberSchema.index({ isActive: 1 });
emailSubscriberSchema.index({ 'preferences.unsubscribed': 1 });
emailSubscriberSchema.index({ source: 1 });
emailSubscriberSchema.index({ tags: 1 });
emailSubscriberSchema.index({ createdAt: -1 });

const EmailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    html: String,
    text: String
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'paused'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['newsletter', 'promotion', 'welcome', 'abandoned_cart', 'product_announcement'],
    required: true
  },
  targetAudience: {
    includeAll: { type: Boolean, default: false },
    tags: [String],
    purchaseHistory: {
      minAmount: Number,
      maxAmount: Number,
      dateRange: {
        start: Date,
        end: Date
      }
    },
    engagement: {
      level: {
        type: String,
        enum: ['all', 'engaged', 'unengaged']
      }
    }
  },
  scheduling: {
    sendNow: { type: Boolean, default: false },
    scheduledDate: Date,
    timezone: { type: String, default: 'UTC' }
  },
  statistics: {
    totalSent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    unsubscribeRate: { type: Number, default: 0 }
  },
  createdBy: String,
  sentDate: Date
}, {
  timestamps: true
});

EmailCampaignSchema.index({ status: 1 });
EmailCampaignSchema.index({ type: 1 });
EmailCampaignSchema.index({ 'scheduling.scheduledDate': 1 });
EmailCampaignSchema.index({ createdAt: -1 });

const EmailEventSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    required: true
  },
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailSubscriber',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  event: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'unsubscribed', 'bounced', 'complained'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    ip: String,
    userAgent: String,
    location: String,
    linkClicked: String,
    bounceReason: String
  }
}, {
  timestamps: true
});

EmailEventSchema.index({ campaignId: 1, event: 1 });
EmailEventSchema.index({ subscriberId: 1, event: 1 });
EmailEventSchema.index({ event: 1, timestamp: -1 });
EmailEventSchema.index({ email: 1 });

export const EmailSubscriber = mongoose.models.EmailSubscriber || mongoose.model('EmailSubscriber', emailSubscriberSchema);
export const EmailCampaign = mongoose.models.EmailCampaign || mongoose.model('EmailCampaign', EmailCampaignSchema);
export const EmailEvent = mongoose.models.EmailEvent || mongoose.model('EmailEvent', EmailEventSchema);
