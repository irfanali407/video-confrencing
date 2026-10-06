import test from 'node:test';
import assert from 'node:assert/strict';

import { createToken, verifyToken } from '../src/utils/token.js';

test('createToken and verifyToken round trip', () => {
  const payload = { userId: 'user-123', username: 'demo_user' };
  const token = createToken(payload);

  assert.equal(typeof token, 'string');
  assert.ok(token.length > 20);

  const decoded = verifyToken(token);
  assert.equal(decoded.userId, payload.userId);
  assert.equal(decoded.username, payload.username);
});
