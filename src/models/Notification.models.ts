import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['vocab', 'comment', 'vocab-trainer', 'vocab-subject', 'system'],
    },
    action: {
      type: String,
      required: true,
      enum: ['created', 'updated', 'deleted', 'multi-created', 'multi-deleted'],
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      expiresAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { recipients: 1, createdAt: -1 },
      { type: 1, action: 1 },
      { 'triggeredBy.userId': 1 },
      { 'metadata.expiresAt': 1 }, // TTL index
    ],
  }
);

// TTL index to automatically delete expired notifications
schema.index({ 'metadata.expiresAt': 1 }, { expireAfterSeconds: 0 });

export const NotificationModel = mongoose.model('Notification', schema);
