module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "os": false,
    "crypto": false,
  };
  return config;
};
