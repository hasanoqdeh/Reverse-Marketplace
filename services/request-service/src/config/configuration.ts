export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    username: process.env.RABBITMQ_USERNAME || 'admin',
    password: process.env.RABBITMQ_PASSWORD || 'password',
    exchange: process.env.RABBITMQ_EXCHANGE || 'reverse_marketplace',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'reverse-marketplace-uploads',
      bucketUrl: process.env.AWS_S3_BUCKET_URL,
    },
  },
  
  request: {
    maxImagesPerRequest: parseInt(process.env.MAX_IMAGES_PER_REQUEST, 10) || 10,
    maxImageSizeMB: parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 10,
    expiryHours: parseInt(process.env.REQUEST_EXPIRY_HOURS, 10) || 72,
    imageQuality: parseInt(process.env.IMAGE_QUALITY, 10) || 80,
  },
  
  cdn: {
    baseUrl: process.env.CDN_BASE_URL,
  },
  
  moderation: {
    profanityFilterEnabled: process.env.PROFANITY_FILTER_ENABLED === 'true',
    spamDetectionEnabled: process.env.SPAM_DETECTION_ENABLED === 'true',
  },
});
