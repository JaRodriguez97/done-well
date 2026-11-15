export const REMOTE_CONFIG_KEYS = {
  ENABLE_STATS: 'enable_stats',
} as const;

export const REMOTE_CONFIG_DEFAULTS = {
  [REMOTE_CONFIG_KEYS.ENABLE_STATS]: true,
} as const;
