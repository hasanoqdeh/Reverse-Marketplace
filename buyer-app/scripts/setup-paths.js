#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a comprehensive TypeScript configuration that works with React Native
const tsconfig = {
  "extends": "@tsconfig/react-native/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/lib/*": ["src/lib/*"],
      "@/components/*": ["src/components/*"],
      "@/contexts/*": ["src/contexts/*"],
      "@/screens/*": ["src/screens/*"],
      "@/services/*": ["src/services/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/navigation/*": ["src/navigation/*"]
    },
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "skipLibCheck": true,
    "strict": false,
    "noImplicitAny": false
  },
  "include": [
    "src/**/*",
    "index.js"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios"
  ]
};

// Write the updated tsconfig.json
fs.writeFileSync(
  path.join(__dirname, '../tsconfig.json'),
  JSON.stringify(tsconfig, null, 2)
);

console.log('✅ TypeScript configuration updated successfully!');
