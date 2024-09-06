process.loadEnvFile();

export default {
  PORT: process.env.PORT ?? 3000,
  REDIS_PORT: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/algo-code",
  CPP_IMAGE: process.env.CPP_IMAGE ?? "gcc",
  JAVA_IMAGE: process.env.JAVA_IMAGE ?? "openjdk",
  PYTHON_IMAGE: process.env.PYTHON_IMAGE ?? "python",
  NODEJS_IMAGE: process.env.NODEJS_IMAGE ?? "node",
};
