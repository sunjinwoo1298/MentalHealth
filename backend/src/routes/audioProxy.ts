import { Router } from 'express';

// In some TypeScript setups `require` may not be recognized without
// @types/node. Declare it locally to keep this wrapper minimal.
declare const require: any;

// Import the existing CommonJS implementation and assert its type.
// Keeping this thin wrapper avoids changing the original JS file while
// providing TypeScript with correct types for imports elsewhere.
// Note: require path targets the JS file directly.
const audioProxy = require('./audioProxy.js') as Router;

export default audioProxy;
