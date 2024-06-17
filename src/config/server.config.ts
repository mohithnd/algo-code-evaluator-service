process.loadEnvFile();

export default {
  PORT: process.env.PORT || 3000,
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/",
};
