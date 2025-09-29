#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting custom build process...');

try {
  // Ensure we're in the right directory
  process.chdir(__dirname);
  
  // Try to make sure vite is executable
  console.log('Setting up permissions...');
  try {
    execSync('chmod +x node_modules/.bin/vite', { stdio: 'inherit' });
  } catch (e) {
    console.log('Permission setting failed, continuing...');
  }
  
  // Run the build
  console.log('Running Vite build...');
  execSync('node node_modules/vite/bin/vite.js build', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
