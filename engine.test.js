const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../engine.js');

const account = (id, service, login, recovery = '', sso = '', twoFactor = 'none') => ({
  id, service, login, recovery, sso, twoFactor,
});

test('normalizes imported records and always replaces supplied IDs', () => {
  const ids = ['fresh-id'];
  const imported = engine.normalizeImportedAccounts([{
    id: '" onmouseover="alert(1)',
    service: '<img src=x onerror=alert(2)>',
    login: 'person@example.test',
  }], () => ids.shift());
  assert.equal(imported[0].id, 'fresh-id');
  assert.equal(imported[0].service, '<img src=x onerror=alert(2)>');
});

test('rejects malformed and incomplete imports', () => {
  assert.throws(() => engine.normalizeImportedAccounts('not an array', () => 'id'), /Invalid account list/);
  assert.throws(() => engine.normalizeImportedAccounts([{ service: 'Only service' }], () => 'id'), /Invalid account list/);
});

test('matches Gmail as the Google SSO provider', () => {
  const accounts = [
    account('gmail', 'Gmail', 'person@gmail.com'),
    account('notion', 'Notion', 'person@example.test', '', 'Google'),
  ];
  const connections = engine.getConnections(accounts);
  assert.deepEqual(connections.map(({ source, target, type }) => [source.id, target.id, type]), [['gmail', 'notion', 'sso']]);
});

test('creates directional recovery and SSO connections without duplicates', () => {
  const accounts = [
    account('google', 'Gmail', 'person@gmail.com'),
    account('bank', 'Bank', 'person@example.test', 'person@gmail.com'),
    account('notes', 'Notes', 'person@example.test', '', 'Google'),
  ];
  const connections = engine.getConnections(accounts);
  assert.equal(connections.length, 2);
  assert.deepEqual(connections.map(({ source, target }) => [source.id, target.id]), [['google', 'bank'], ['google', 'notes']]);
});

test('does not invent downstream accounts for an isolated SMS account', () => {
  const results = engine.recommendations([account('sms', 'SMS Account', 'person@example.test', '', '', 'sms')]);
  assert.equal(results.length, 1);
  assert.equal(results[0].outgoing.length, 0);
});
