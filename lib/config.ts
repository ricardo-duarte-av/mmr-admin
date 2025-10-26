export interface MMRConfig {
  baseUrl: string;
  apiKey: string;
}

export interface MatrixConfig {
  homeserverUrl: string;
  accessToken: string;
}

export interface AppConfig {
  mmr: MMRConfig;
  matrix: MatrixConfig;
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
      mmr: {
        baseUrl: '',
        apiKey: ''
      },
      matrix: {
        homeserverUrl: '',
        accessToken: ''
      }
    };
  }
}

// Get MMR configuration
export function getMMRConfig(): MMRConfig {
  const config = loadConfig();
  return config.mmr;
}

// Get Matrix configuration
export function getMatrixConfig(): MatrixConfig {
  const config = loadConfig();
  return config.matrix;
}

// Check if configuration is complete
export function isConfigComplete(): boolean {
  const mmrConfig = getMMRConfig();
  const matrixConfig = getMatrixConfig();
  
  return !!(mmrConfig.baseUrl && mmrConfig.apiKey && matrixConfig.homeserverUrl && matrixConfig.accessToken);
}
