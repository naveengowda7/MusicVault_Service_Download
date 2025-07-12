import mongoose from 'mongoose';

const audioFileSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['downloading', 'completed', 'failed'],
    default: 'downloading'
  }
});

export default mongoose.model('AudioFile', audioFileSchema);