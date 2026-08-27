import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycrew.charades',
  appName: 'Charades',
  webDir: 'dist',
  backgroundColor: '#1b1033',
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#1b1033',
  },
};

export default config;
