// On a trusted machine:
// ADMIN_PASSWORD='a-unique-strong-password' npm run security:hash-admin
// Copy only the generated hash to Vercel ADMIN_PASSWORD_HASH (server environment).
import {randomBytes,scrypt as scryptCallback} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
const password=process.env.ADMIN_PASSWORD;
if(!password || password.length<16 || password.length>128)
  throw new Error('Set ADMIN_PASSWORD to a unique password of at least 16 characters.');
const salt=randomBytes(16).toString('hex');
const value=(await scrypt(password,Buffer.from(salt,'hex'),64)).toString('hex');
console.log(`scrypt:v1:${salt}:${value}`);
