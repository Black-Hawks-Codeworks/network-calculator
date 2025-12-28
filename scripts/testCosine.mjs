/* eslint-env node */

import { cosineSimilarity } from '../src/shared/utils/cos-similarity.js';

console.log(cosineSimilarity([3, 6], [2, 4]));
console.log(cosineSimilarity([1,5],[2,4]));


// node scripts/testCosine.mjs

// liakooras@MacBook-Air-Elias network-calculator % node scripts/testCosine.mjs
// 0.9999999999999999
