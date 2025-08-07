/**
 * 워커 관련 설정 관리
 * @module config/workerConfig
 */

interface WorkerSettings {
  maxRetries: number;
  timeout: number;
  memoryThreshold: number;
}

interface CompressionSettings {
  level: number;
  chunkSize: number;
  batchSize: number;
}

interface NetworkSettings {
  timeout: number;
  retryDelay: number;
  maxRetries: number;
}

interface MobileSettings {
  compression: CompressionSettings;
  network: NetworkSettings;
}

interface WorkerConfigType {
  worker: WorkerSettings;
  compression: CompressionSettings;
  network: NetworkSettings;
  mobile: MobileSettings;
}

export const WorkerConfig: WorkerConfigType = {
  worker: {
    maxRetries: 3,
    timeout: 30000,
    memoryThreshold: 90,
  },
  compression: {
    level: 6,
    chunkSize: 2 * 1024 * 1024,
    batchSize: 5,
  },
  network: {
    timeout: 45000,
    retryDelay: 1000,
    maxRetries: 3,
  },
  mobile: {
    compression: {
      level: 4,
      chunkSize: 1 * 1024 * 1024,
      batchSize: 3,
    },
    network: {
      timeout: 60000,
      retryDelay: 2000,
      maxRetries: 4,
    },
  },
};

/**
 * 디바이스 환경에 따른 설정 최적화
 * @param {boolean} isMobileDevice - 모바일 디바이스 여부
 * @param {number} deviceMemory - 디바이스 메모리 (GB)
 * @returns {WorkerConfigType} 최적화된 설정
 */
export const getOptimizedConfig = (
  isMobileDevice: boolean,
  deviceMemory: number = 4
): WorkerConfigType => {
  const baseConfig = { ...WorkerConfig };

  if (isMobileDevice) {
    return {
      ...baseConfig,
      compression: {
        ...baseConfig.compression,
        ...baseConfig.mobile.compression,
      },
      network: {
        ...baseConfig.network,
        ...baseConfig.mobile.network,
      },
    };
  }

  // 메모리에 따른 설정 최적화
  const memoryFactor = Math.max(0.5, Math.min(2, deviceMemory / 4));
  return {
    ...baseConfig,
    compression: {
      ...baseConfig.compression,
      chunkSize: Math.floor(baseConfig.compression.chunkSize * memoryFactor),
      batchSize: Math.floor(baseConfig.compression.batchSize * memoryFactor),
    },
  };
};

/**
 * 설정 유효성 검사
 * @param {WorkerConfigType} config - 검사할 설정 객체
 * @returns {boolean} 유효성 검사 결과
 */
export const validateConfig = (config: WorkerConfigType): boolean => {
  const requiredFields: Record<keyof WorkerConfigType, string[]> = {
    worker: ['maxRetries', 'timeout', 'memoryThreshold'],
    compression: ['level', 'chunkSize', 'batchSize'],
    network: ['timeout', 'retryDelay', 'maxRetries'],
    mobile: ['compression', 'network'],
  };

  try {
    Object.entries(requiredFields).forEach(([category, fields]) => {
      if (!config[category as keyof WorkerConfigType]) {
        throw new Error(`Missing category: ${category}`);
      }

      fields.forEach((field) => {
        const categoryConfig = config[category as keyof WorkerConfigType];
        if (typeof categoryConfig === 'object' && categoryConfig !== null) {
          if (!(field in categoryConfig)) {
            throw new Error(`Missing field: ${category}.${field}`);
          }
        }
      });
    });

    return true;
  } catch (error) {
    console.error(
      'Config validation failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return false;
  }
};
