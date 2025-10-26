export interface AppConfig {
  homeserverUrl: string;
  accessToken: string;
}

// Load configuration from config.json
export function loadConfig(): AppConfig {
  try {
    // In a real deployment, you might want to load this from environment variables
    // or a server-side configuration file
    const config = require('../config.json');
    return config as AppConfig;
  } catch (error) {
    console.warn('Could not load config.json, using defaults');
    return {
      homeserverUrl: '',
      accessToken: ''
    };
  }
}

// Get MMR configuration (derived from main config)
export function getMMRConfig(): { baseUrl: string; apiKey: string } {
  const config = loadConfig();
  return {
    baseUrl: config.homeserverUrl,
    apiKey: config.accessToken
  };
}

// Get Matrix configuration (same as main config)
export function getMatrixConfig(): { homeserverUrl: string; accessToken: string } {
  const config = loadConfig();
  return {
    homeserverUrl: config.homeserverUrl,
    accessToken: config.accessToken
  };
}

// Check if configuration is complete
export function isConfigComplete(): boolean {
  const config = loadConfig();
  return !!(config.homeserverUrl && config.accessToken);
}
