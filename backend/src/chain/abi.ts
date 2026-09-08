// pons v2 ABI fragments transcribed from https://docs.ponsfamily.com/v2 (snapshot read September 7, 2026).
// Only the entry points Plum uses are included. The three-argument launchToken overload is the one
// encoded; the snipe-exemption overload is omitted so encoding is unambiguous.
// Custom error parameter lists are not published; they are declared without inputs so a matching
// selector decodes by name, and unknown revert data is surfaced raw.

const socials = { name: 'socials', type: 'tuple', components: [
  { name: 'twitter', type: 'string' },
  { name: 'telegram', type: 'string' },
  { name: 'discord', type: 'string' },
  { name: 'website', type: 'string' },
  { name: 'farcaster', type: 'string' },
] } as const

export const tokenParamsComponents = [
  { name: 'name', type: 'string' },
  { name: 'symbol', type: 'string' },
  { name: 'logo', type: 'string' },
  { name: 'description', type: 'string' },
  socials,
  { name: 'creatorFeeRecipient', type: 'address' },
  { name: 'creatorTaxBps', type: 'uint16' },
  { name: 'buybackEnabled', type: 'bool' },
  { name: 'expectedEconomics', type: 'bytes32' },
  { name: 'salt', type: 'bytes32' },
] as const

const launchConfigComponents = [
  { name: 'supply', type: 'uint256' },
  { name: 'curveFeeBps', type: 'uint256' },
  { name: 'phantomQuote', type: 'uint256' },
  { name: 'graduationThreshold', type: 'uint256' },
  { name: 'poolFee', type: 'uint24' },
  { name: 'tickSpacing', type: 'int24' },
  { name: 'enabled', type: 'bool' },
] as const

const launchedTokenComponents = [
  { name: 'token', type: 'address' },
  { name: 'curve', type: 'address' },
  { name: 'deployer', type: 'address' },
  { name: 'creatorFeeRecipient', type: 'address' },
  { name: 'pairToken', type: 'address' },
  { name: 'graduationThreshold', type: 'uint256' },
  { name: 'poolFee', type: 'uint24' },
  { name: 'tickSpacing', type: 'int24' },
  { name: 'creatorTaxBps', type: 'uint16' },
  { name: 'buybackEnabled', type: 'bool' },
  { name: 'phase', type: 'uint8' },
  { name: 'sweptQuote', type: 'uint256' },
  { name: 'sweptTokens', type: 'uint256' },
  { name: 'sweptAt', type: 'uint256' },
  { name: 'exists', type: 'bool' },
] as const

const errors = [
  'SlippageExceeded', 'CurveGraduated', 'LaunchEconomicsMismatch', 'PairTokenNotApproved',
  'NotWhitelisted', 'CreatorTaxTooHigh', 'InternalSwapRequiresOperator',
].map(name => ({ type: 'error', name, inputs: [] }) as const)

export const factoryAbi = [
  { type: 'function', name: 'launchToken', stateMutability: 'payable',
    inputs: [
      { name: 'params', type: 'tuple', components: tokenParamsComponents },
      { name: 'launchConfigId', type: 'uint256' },
      { name: 'pairToken', type: 'address' },
    ],
    outputs: [{ name: 'token', type: 'address' }, { name: 'curve', type: 'address' }] },
  { type: 'function', name: 'getLaunchConfig', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'tuple', components: launchConfigComponents }] },
  { type: 'function', name: 'launchConfigCount', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'previewLaunchEconomics', stateMutability: 'view',
    inputs: [{ name: 'launchConfigId', type: 'uint256' }, { name: 'pairToken', type: 'address' }], outputs: [{ name: '', type: 'bytes32' }] },
  { type: 'function', name: 'launchFee', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'launchEnabled', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'maxCreatorTaxBps', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'approvedPairTokens', stateMutability: 'view', inputs: [{ name: 'pairToken', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'canLaunch', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'getLaunchedToken', stateMutability: 'view', inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'tuple', components: launchedTokenComponents }] },
  { type: 'event', name: 'TokenLaunched', inputs: [
    { name: 'token', type: 'address', indexed: true },
    { name: 'curve', type: 'address', indexed: true },
    { name: 'deployer', type: 'address', indexed: true },
    { name: 'pairToken', type: 'address', indexed: false },
    { name: 'launchConfigId', type: 'uint256', indexed: false },
    { name: 'graduationThreshold', type: 'uint256', indexed: false },
  ] },
  ...errors,
] as const

export const routerAbi = [
  { type: 'function', name: 'launchAndBuy', stateMutability: 'payable',
    inputs: [
      { name: 'params', type: 'tuple', components: tokenParamsComponents },
      { name: 'launchConfigId', type: 'uint256' },
      { name: 'pairToken', type: 'address' },
      { name: 'quoteIn', type: 'uint256' },
      { name: 'minTokensOut', type: 'uint256' },
      { name: 'recipient', type: 'address' },
      { name: 'snipeTaxExemptions', type: 'address[]' },
    ],
    outputs: [{ name: 'token', type: 'address' }, { name: 'curve', type: 'address' }, { name: 'tokensOut', type: 'uint256' }] },
  ...errors,
] as const

export const PHASES = ['NotGraduated', 'Swept', 'PoolCreated', 'Rescued'] as const
