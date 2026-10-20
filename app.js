const state = { accounts: [], editingId: null };

const $ = (selector) => document.querySelector(selector);
const accountList = $('#accountList');
const dialog = $('#accountDialog');

function id() {
  return `account-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function initials(name) {
  return name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]));
}

function getConnections() {
  return FirebreakEngine.getConnections(state.accounts);
}

function recommendations() {
  return FirebreakEngine.recommendations(state.accounts);
}

function renderAccounts() {
  $('#accountCount').textContent = state.accounts.length;
  if (!state.accounts.length) {
    accountList.innerHTML = '<div class="empty-state"><span class="empty-icon">＋</span><strong>No accounts yet</strong><span>Add an account or load the demo to see your map.</span><button class="button button-small button-primary" id="emptyAddButton">Add first account</button></div>';
    $('#emptyAddButton').addEventListener('click', () => openDialog());
    return;
  }
  accountList.innerHTML = state.accounts.map((account) => `
    <div class="account-row">
      <span class="account-avatar">${escapeHtml(initials(account.service))}</span>
      <div class="account-info"><span class="account-name">${escapeHtml(account.service)}</span><span class="account-meta">${escapeHtml(account.login)}${account.sso ? ` · via ${escapeHtml(account.sso)}` : ''}</span></div>
      <div class="row-actions"><button data-edit="${account.id}" title="Edit account">✎</button><button data-remove="${account.id}" title="Remove account">×</button></div>
    </div>`).join('');
  accountList.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => openDialog(button.dataset.edit)));
  accountList.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => removeAccount(button.dataset.remove)));
}

function renderMap() {
  const canvas = $('#appMap');
  const connections = getConnections();
  if (!state.accounts.length) {
    canvas.innerHTML = '<div class="map-empty">Your map will appear here</div>';
    return;
  }
  const width = 680; const height = 287;
  const ranked = [...state.accounts].sort((a, b) => {
    const aCount = connections.filter((connection) => connection.source.id === a.id).length;
    const bCount = connections.filter((connection) => connection.source.id === b.id).length;
    return bCount - aCount;
  });
  const center = ranked[0];
  const others = state.accounts.filter((account) => account.id !== center.id);
  const cx = 340; const cy = 143;
  const nodes = [{ account: center, x: cx, y: cy, root: true }, ...others.map((account, index) => {
    const angle = (Math.PI * 2 * index / Math.max(others.length, 1)) - Math.PI / 2;
    return { account, x: cx + Math.cos(angle) * Math.min(240, 75 + others.length * 18), y: cy + Math.sin(angle) * 102 };
  })];
  const nodeById = new Map(nodes.map((node) => [node.account.id, node]));
  const lines = connections.map((connection) => {
    const source = nodeById.get(connection.source.id); const target = nodeById.get(connection.target.id);
    if (!source || !target) return '';
    return `<path class="app-line ${connection.type === 'sso' ? 'sso-line' : ''}" marker-end="url(#arrow)" d="M${source.x} ${source.y} C${(source.x + target.x) / 2} ${source.y} ${(source.x + target.x) / 2} ${target.y} ${target.x} ${target.y}"/>`;
  }).join('');
  const nodeMarkup = nodes.map((node) => `<g class="app-node ${node.root ? 'app-root' : ''}" transform="translate(${node.x} ${node.y})"><circle r="${node.root ? 29 : 21}"></circle><text y="4" text-anchor="middle">${escapeHtml(initials(node.account.service).slice(0, 2))}</text><text class="node-label" y="${node.root ? 47 : 37}" text-anchor="middle">${escapeHtml(node.account.service.slice(0, 16))}</text></g>`).join('');
  canvas.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Your account dependency map"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3e9d7a"/></marker></defs>${lines}${nodeMarkup}</svg>`;
}

function renderInsights() {
  const ranked = recommendations();
  const total = state.accounts.length;
  const score = total ? Math.min(99, Math.round((ranked[0]?.score || 0) * 2.4 + (getConnections().length * 3))) : null;
  $('#blastScore').textContent = score === null ? '—' : String(score).padStart(2, '0');
  $('#scoreHint').textContent = score === null ? 'Add accounts to calculate' : score > 60 ? 'Several high-impact paths found' : 'Your current exposure level';
  const container = $('#recommendations');
  if (!ranked.length) {
    container.innerHTML = '<div class="insights-empty">Recommendations appear once Firebreak has enough account connections to analyze. Add recovery emails or SSO providers to reveal paths.</div>';
  } else {
    container.innerHTML = ranked.slice(0, 3).map((item, index) => {
      const pathCount = item.outgoing.length;
      const action = item.account.twoFactor === 'sms' ? 'Move from SMS codes to an authenticator app or passkey' : 'Review and strengthen this account’s recovery options';
      const reason = pathCount
        ? `${escapeHtml(item.account.service)} is a recovery or sign-in path for ${pathCount} other account${pathCount === 1 ? '' : 's'}${item.account.twoFactor === 'sms' ? ', and it uses SMS-based 2FA' : ''}.`
        : `${escapeHtml(item.account.service)} uses SMS-based 2FA, but no downstream recovery or sign-in paths are currently mapped.`;
      return `<article class="recommendation"><span class="rec-rank">0${index + 1}</span><div><div class="rec-title">${escapeHtml(item.account.service)} is a high-impact account</div><p class="rec-reason">${reason}</p><div class="rec-action">→ ${action}</div></div><span class="confidence ${pathCount ? 'high' : 'medium'}">${pathCount ? 'HIGH' : 'MEDIUM'} CONFIDENCE</span></article>`;
    }).join('');
  }
  const select = $('#breachedAccount');
  const previous = select.value;
  select.innerHTML = '<option value="">Select an account...</option>' + state.accounts.map((account) => `<option value="${account.id}">${escapeHtml(account.service)}</option>`).join('');
  select.value = state.accounts.some((account) => account.id === previous) ? previous : '';
}

function render() { renderAccounts(); renderMap(); renderInsights(); }

function openDialog(accountId) {
  state.editingId = accountId || null;
  const account = state.accounts.find((item) => item.id === accountId);
  $('#dialogTitle').textContent = account ? 'Edit account' : 'Add an account';
  $('#accountId').value = account?.id || '';
  $('#serviceName').value = account?.service || '';
  $('#loginEmail').value = account?.login || '';
  $('#recoveryPath').value = account?.recovery || '';
  $('#ssoProvider').value = account?.sso || '';
  $('#twoFactor').value = account?.twoFactor || 'none';
  dialog.showModal();
  $('#serviceName').focus();
}

function removeAccount(accountId) {
  state.accounts = state.accounts.filter((account) => account.id !== accountId);
  render(); showToast('Account removed from this map');
}

function loadDemo() {
  state.accounts = [
    { id: id(), service: 'Gmail', login: 'alex@gmail.com', recovery: '+1 555 0100', sso: '', twoFactor: 'sms' },
    { id: id(), service: 'Bank', login: 'alex@example.com', recovery: 'alex@gmail.com', sso: '', twoFactor: 'authenticator' },
    { id: id(), service: 'GitHub', login: 'alex@example.com', recovery: 'alex@gmail.com', sso: '', twoFactor: 'passkey' },
    { id: id(), service: 'Notion', login: 'alex@example.com', recovery: '', sso: 'Google', twoFactor: 'none' },
    { id: id(), service: 'Shopping', login: 'alex@gmail.com', recovery: '', sso: '', twoFactor: 'email' },
    { id: id(), service: 'Travel', login: 'alex@example.com', recovery: 'alex@gmail.com', sso: '', twoFactor: 'none' },
  ];
  render(); showToast('Demo persona loaded');
  $('#workspace').scrollIntoView({ behavior: 'smooth' });
}

function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }

$('#accountForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const entry = { id: $('#accountId').value || id(), service: $('#serviceName').value.trim(), login: $('#loginEmail').value.trim(), recovery: $('#recoveryPath').value.trim(), sso: $('#ssoProvider').value, twoFactor: $('#twoFactor').value };
  const existingIndex = state.accounts.findIndex((account) => account.id === entry.id);
  if (existingIndex >= 0) state.accounts[existingIndex] = entry; else state.accounts.push(entry);
  dialog.close(); render(); showToast(existingIndex >= 0 ? 'Account updated' : 'Account added to your map');
});
$('#cancelDialog').addEventListener('click', () => dialog.close());
$('#addAccountButton').addEventListener('click', () => openDialog());
$('#startButton').addEventListener('click', () => { $('#workspace').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => openDialog(), 450); });
$('#emptyAddButton')?.addEventListener('click', () => openDialog());
$('#loadDemoButton').addEventListener('click', loadDemo);
$('#seeDemoButton').addEventListener('click', loadDemo);
$('#privacyButton').addEventListener('click', () => $('#privacySection').scrollIntoView({ behavior: 'smooth' }));
$('#importButton').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported) || imported.some((item) => !item.service || !item.login)) throw new Error('Invalid account list');
      state.accounts = FirebreakEngine.normalizeImportedAccounts(imported, id);
      render(); showToast('Account map imported');
    } catch { showToast('Could not import that JSON file'); }
  };
  reader.readAsText(file); event.target.value = '';
});
$('#exportButton').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state.accounts, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'firebreak-account-map.json'; link.click(); URL.revokeObjectURL(link.href); showToast('Private map exported');
});
$('#clearButton').addEventListener('click', () => { if (state.accounts.length && confirm('Clear every account from this map?')) { state.accounts = []; render(); showToast('Map cleared'); } });
$('#breachedAccount').addEventListener('change', (event) => {
  const account = state.accounts.find((item) => item.id === event.target.value);
  const result = $('#breachResult');
  if (!account) { result.innerHTML = '<span class="breach-shield">✓</span><strong>Choose an account to get a recovery checklist.</strong><span>We’ll prioritize the paths that may be exposed next.</span>'; return; }
  const downstream = getConnections().filter((connection) => connection.source.id === account.id);
  const steps = [`Secure ${account.service} first and review active sessions`, ...downstream.slice(0, 2).map((connection) => `Update recovery path for ${connection.target.service}`), account.twoFactor === 'sms' ? 'Replace SMS codes with an authenticator app or passkey' : 'Confirm a strong, unique recovery method'];
  result.innerHTML = `<span class="breach-shield">!</span><strong>Start with ${escapeHtml(account.service)}</strong><span>Ranked next steps based on ${downstream.length} path${downstream.length === 1 ? '' : 's'} from this account.</span><ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
});

render();
