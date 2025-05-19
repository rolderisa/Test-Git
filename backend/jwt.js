// Generate a random JWT secret
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log(jwtSecret);


// using git bash to generate a random JWT secret we use this command  