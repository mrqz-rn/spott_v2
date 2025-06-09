import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'SPOTT-V2',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true 
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
  }
};

export default config;
