// Bounded, read-only RPC checks. Run from the repository root with Node 24:
// node --env-file=.env scripts/check-launch-apis.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const factory = '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e';
const router = '0xe33E9E479dF8802cb0866d5d05258bEc4cF62948';
const legacyFactory = '0x0c37a24F5D23A486FA692d1500881d698B1F77a4';
const referenceTx = '0x1f54f25fec2d963dcb338ecb8b46a6eb123198a5c7a746d34cb2dbe78d074af8';
const allowed = new Set(['eth_chainId', 'eth_getBlockByNumber', 'eth_gasPrice',
  'eth_getCode', 'web3_sha3', 'eth_call', 'eth_getTransactionReceipt', 'eth_getLogs']);
const report = { checkedAt: new Date().toISOString(), mode: 'read-only', networks: {} };
const secrets = ['ALCHEMY_API_KEY', 'MOBULA_API_KEY', 'ROBINHOOD_RPC_URL',
  'ROBINHOOD_TESTNET_RPC_URL'].map(key => process.env[key]).filter(Boolean);
function redact(text) {
  let value = String(text);
  for (const secret of secrets) value = value.replaceAll(secret, '[REDACTED]');
  return value.replace(/(?:https?|wss?):\/\/[^\s"<>]+/g, '[endpoint redacted]');
}
function word(value) { return BigInt(value).toString(16).padStart(64, '0'); }
function uint(value) {
  if (!/^0x[0-9a-f]{64}$/i.test(value)) throw new Error('Expected one ABI word');
  return BigInt(value).toString();
}

async function websocketCheck(endpoint, expectedChainId) {
  const url = new URL(endpoint);
  url.protocol = 'wss:';
  return new Promise(resolve => {
    let socket;
    let finished = false;
    let subscription;
    const start = performance.now();
    const finish = result => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (socket?.readyState === WebSocket.OPEN && subscription) {
        socket.send(JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'eth_unsubscribe', params: [subscription] }));
      }
      socket?.close();
      resolve({ ...result, elapsedMs: Math.round(performance.now() - start) });
    };
    const timer = setTimeout(() => finish({ ok: false, error: 'Timed out waiting for a new block (15s)' }), 15000);
    try {
      socket = new WebSocket(url);
      socket.addEventListener('open', () => socket.send(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] })));
      socket.addEventListener('error', () => finish({ ok: false, error: 'WebSocket connection error' }));
      socket.addEventListener('close', () => finish({ ok: false, error: 'Socket closed before new block' }));
      socket.addEventListener('message', event => {
        try {
          const value = JSON.parse(String(event.data));
          if (value.error) return finish({ ok: false, code: value.error.code, error: redact(value.error.message) });
          if (value.id === 1) {
            if (Number(BigInt(value.result)) !== expectedChainId) return finish({ ok: false, error: 'WebSocket chain mismatch' });
            socket.send(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'eth_subscribe', params: ['newHeads'] }));
          } else if (value.id === 2) subscription = value.result;
          else if (value.method === 'eth_subscription' && value.params?.subscription === subscription) {
            const head = value.params.result;
            finish({ ok: true, chainId: expectedChainId, blockNumber: Number(BigInt(head.number)), blockHash: head.hash });
          }
        } catch { finish({ ok: false, error: 'Malformed WebSocket response' }); }
      });
    } catch { finish({ ok: false, error: 'Could not initialize WebSocket' }); }
  });
}

for (const [name, variable, chainId] of [
  ['mainnet', 'ROBINHOOD_RPC_URL', 4663],
  ['testnet', 'ROBINHOOD_TESTNET_RPC_URL', 46630],
]) {
  const endpoint = process.env[variable];
  const network = report.networks[name] = { expectedChainId: chainId, checks: [], httpRequests: 0 };
  if (!endpoint) { network.error = `Missing ${variable}`; continue; }
  const expectedHost = `robinhood-${name}.g.alchemy.com`;
  let parsed;
  try { parsed = new URL(endpoint); }
  catch { network.error = 'Invalid endpoint URL'; continue; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== expectedHost || !parsed.pathname.startsWith('/v2/')) {
    network.error = 'Endpoint failed host/protocol validation'; continue;
  }
  async function rpc(method, params = []) {
    if (!allowed.has(method)) throw new Error('Method is not read-only allowlisted');
    const id = ++network.httpRequests;
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const value = await response.json();
    if (value.id !== id || value.jsonrpc !== '2.0') throw new Error('Invalid RPC response envelope');
    if (value.error) throw new Error(`RPC ${value.error.code}: ${redact(value.error.message)}`);
    return value.result;
  }
  async function check(label, operation) {
    const start = performance.now();
    try {
      const value = await operation();
      network.checks.push({ label, ok: true, elapsedMs: Math.round(performance.now() - start), value });
      return value;
    } catch (error) {
      network.checks.push({ label, ok: false, elapsedMs: Math.round(performance.now() - start), error: redact(error.message) });
      return undefined;
    }
  }
  const actualChain = await check('eth_chainId', async () => {
    const actual = Number(BigInt(await rpc('eth_chainId')));
    if (actual !== chainId) throw new Error(`Expected ${chainId}, got ${actual}`);
    return actual;
  });
  if (actualChain !== chainId) continue;
  const [block] = await Promise.all([
    check('latest block', async () => {
      const value = await rpc('eth_getBlockByNumber', ['latest', false]);
      return { number: Number(BigInt(value.number)), hex: value.number, hash: value.hash,
        timestamp: new Date(Number(BigInt(value.timestamp)) * 1000).toISOString(), transactionCount: value.transactions.length };
    }),
    check('eth_gasPrice', async () => ({ wei: BigInt(await rpc('eth_gasPrice')).toString() })),
  ]);
  const blockTag = block?.hex ?? 'latest';
  for (const [role, address] of [['factory', factory], ['launchAndBuy', router]]) {
    await check(`code at documented mainnet ${role} address`, async () => {
      const code = await rpc('eth_getCode', [address, blockTag]);
      return { address, block: blockTag, present: code !== '0x', bytes: (code.length - 2) / 2,
        note: name === 'testnet' ? 'Address reuse check; not a claimed testnet deployment' : 'Presence is not source-code verification' };
    });
  }
  if (name === 'mainnet') {
    async function read(signature, args = '') {
      const digest = await rpc('web3_sha3', ['0x' + Buffer.from(signature).toString('hex')]);
      return rpc('eth_call', [{ to: factory, data: digest.slice(0, 10) + args }, blockTag]);
    }
    for (const signature of ['launchFee()', 'launchEnabled()', 'maxCreatorTaxBps()', 'launchConfigCount()']) {
      await check(signature, async () => ({ block: blockTag, raw: uint(await read(signature)) }));
    }
    await check('canLaunch(arbitrary probe address)', async () => ({ block: blockTag,
      probeAddress: '0x000000000000000000000000000000000000dEaD',
      raw: uint(await read('canLaunch(address)', word('0xdead'))),
      note: 'Read-only probe, not the user wallet; launch simulation remains untested' }));
    await check('getLaunchConfig(0)', async () => {
      const result = await read('getLaunchConfig(uint256)', word(0));
      if (!/^0x[0-9a-f]{448}$/i.test(result)) throw new Error('Expected seven ABI words');
      const values = result.slice(2).match(/.{64}/g).map(value => BigInt('0x' + value));
      const names = ['supply', 'curveFeeBps', 'phantomQuote', 'graduationThreshold', 'poolFee', 'tickSpacing', 'enabled'];
      const data = Object.fromEntries(names.map((field, i) => [field, (field === 'tickSpacing' ? BigInt.asIntN(24, values[i]) : values[i]).toString()]));
      return { block: blockTag, configId: 0, ...data };
    });
    await check('previewLaunchEconomics(0, native ETH)', async () => ({ block: blockTag,
      expectedEconomics: await read('previewLaunchEconomics(uint256,address)', word(0) + word(0)) }));
    const receipt = await check('reference legacy launch receipt', async () => {
      const value = await rpc('eth_getTransactionReceipt', [referenceTx]);
      if (!value || value.transactionHash.toLowerCase() !== referenceTx || value.status !== '0x1') throw new Error('Reference receipt missing or unsuccessful');
      return { transactionHash: value.transactionHash, blockNumber: value.blockNumber, blockHash: value.blockHash,
        status: value.status, gasUsed: BigInt(value.gasUsed).toString(), logCount: value.logs.length };
    });
    if (receipt) await check('one-block historical factory logs', async () => {
      const logs = await rpc('eth_getLogs', [{ address: legacyFactory, fromBlock: receipt.blockNumber, toBlock: receipt.blockNumber }]);
      const matching = logs.filter(log => log.transactionHash.toLowerCase() === referenceTx && log.blockHash === receipt.blockHash);
      if (!matching.length) throw new Error('Reference transaction absent from factory log result');
      return { blockNumber: receipt.blockNumber, totalLogs: logs.length, matchingReferenceLogs: matching.length };
    });
  }
  network.websocket = await websocketCheck(endpoint, chainId);
  console.log(`${name}: ${network.checks.filter(check => check.ok).length}/${network.checks.length} HTTP checks passed; WebSocket ${network.websocket.ok ? 'passed' : 'failed'}`);
}

const filename = `alchemy-rpc-${report.checkedAt.slice(0, 10)}.json`;
const output = new URL(`../docs/api-evidence/${filename}`, import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
await writeFile(output, redact(JSON.stringify(report, null, 2)) + '\n');
console.log(`Sanitized results saved to docs/api-evidence/${filename}`);
if (Object.values(report.networks).some(network => network.error || network.checks.some(check => !check.ok) || !network.websocket?.ok)) process.exitCode = 1;
