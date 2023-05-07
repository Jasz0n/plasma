const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    config.experiments = {
      layers: true, // Enable the layers feature
    };

    return config;
  },
};

module.exports = nextConfig;
