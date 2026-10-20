(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FirebreakEngine = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  function providerKey(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return {
      google: 'google', gmail: 'google',
      microsoft: 'microsoft', outlook: 'microsoft',
      apple: 'apple', github: 'github', facebook: 'facebook',
    }[normalized] || normalized;
  }

  function getConnections(accounts) {
    const connections = [];
    const byLogin = new Map();
    accounts.forEach((account) => {
      const key = account.login.trim().toLowerCase();
      if (key) byLogin.set(key, [...(byLogin.get(key) || []), account]);
    });
    accounts.forEach((account) => {
      const recovery = account.recovery.trim().toLowerCase();
      if (recovery && byLogin.has(recovery)) {
        byLogin.get(recovery).forEach((source) => {
          if (source.id !== account.id) connections.push({ source, target: account, type: 'recovery', confidence: 'high' });
        });
      }
      if (account.sso) {
        accounts.filter((source) => providerKey(source.service) === providerKey(account.sso) && source.id !== account.id)
          .forEach((source) => connections.push({ source, target: account, type: 'sso', confidence: 'medium' }));
      }
    });
    return connections;
  }

  function recommendations(accounts) {
    const connections = getConnections(accounts);
    return accounts.map((account) => {
      const outgoing = connections.filter((connection) => connection.source.id === account.id);
      const phone = account.recovery.trim().startsWith('+');
      const twoFactorPenalty = account.twoFactor === 'none' ? 2 : account.twoFactor === 'sms' ? 1 : 0;
      return { account, outgoing, score: outgoing.length * 10 + (phone ? 2 : 0) + twoFactorPenalty };
    }).filter((result) => result.outgoing.length || result.account.twoFactor === 'sms')
      .sort((a, b) => b.score - a.score);
  }

  function normalizeImportedAccounts(items, createId) {
    if (!Array.isArray(items) || items.some((item) => !item || !item.service || !item.login)) {
      throw new Error('Invalid account list');
    }
    return items.map((item) => ({
      id: createId(),
      service: String(item.service),
      login: String(item.login),
      recovery: String(item.recovery || ''),
      sso: String(item.sso || ''),
      twoFactor: String(item.twoFactor || 'none'),
    }));
  }

  return { providerKey, getConnections, recommendations, normalizeImportedAccounts };
}));
