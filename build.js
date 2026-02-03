#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load card data
const cards = require('/tmp/cards_raw.js');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

const SITE = 'https://onchainbanks.io';
const today = new Date().toISOString().split('T')[0];

// Process cards into clean bank objects
const banks = cards.map(c => ({
  name: c.name,
  slug: slugify(c.name),
  network: c.network || 'TBD',
  chain: c.chain || 'Multi-chain',
  custody: c.custody || 'TBD',
  cashback: c.cashback || 'TBD',
  cashbackToken: c.cashbackToken || 'TBD',
  annualFee: c.annualFee || 'TBD',
  fxFee: c.fxFee || 'TBD',
  category: c.category || 'onchain',
  archetype: c.archetype || 'wallet',
  regions: c.regions || ['global'],
  website: c.website || '#',
  logo: c.logo || '',
  features: c.features || [],
  perks: c.perks || [],
  spendbaseUrl: `https://spendbase.cards/card/${slugify(c.name)}/`,
  comingSoon: c.comingSoon || false,
  tier: c.tier || null,
  token: c.token || null
}));

const bankCount = banks.length;

// Chain mapping for pages
const chainMap = {
  'solana': { name: 'Solana', desc: 'Solana is the fastest-growing blockchain for crypto cards, known for sub-second finality and near-zero fees. Multiple wallet providers and DeFi protocols on Solana now offer Visa and Mastercard debit cards.' },
  'ethereum': { name: 'Ethereum', desc: 'Ethereum remains the foundational blockchain for DeFi and onchain banking. Several cards allow direct spending from Ethereum wallets, with some leveraging L2 solutions for lower fees.' },
  'base': { name: 'Base', desc: 'Base is Coinbase\'s Ethereum L2, gaining traction with DeFi-native card products. Low fees and Coinbase backing make it attractive for onchain spending solutions.' },
  'bitcoin': { name: 'Bitcoin', desc: 'Bitcoin cards let you earn sats-back rewards or spend BTC via Lightning Network. These products appeal to Bitcoin maximalists who want to stack sats on every purchase.' },
  'scroll': { name: 'Scroll', desc: 'Scroll is an Ethereum L2 using zkEVM technology. Ether.fi Cash, the top-ranked crypto card, operates on Scroll with its DeFi credit model.' },
  'starknet': { name: 'Starknet', desc: 'Starknet uses zero-knowledge proofs for scalability. Ready card leverages Starknet\'s account abstraction for a true self-custody spending experience.' },
  'gnosis': { name: 'Gnosis', desc: 'Gnosis Chain powers Gnosis Pay, one of the first self-custody Visa cards in Europe. The chain\'s Safe wallet infrastructure enables multi-sig card spending.' },
  'multi-chain': { name: 'Multi-Chain', desc: 'Multi-chain cards support spending from wallets across multiple blockchains. These products abstract away chain complexity, letting users spend from any supported network.' },
  'bnb-chain': { name: 'BNB Chain', desc: 'BNB Chain powers Binance\'s card ecosystem, one of the largest in crypto. BNB stakers can earn up to 8% cashback on the Binance Card.' },
  'cronos': { name: 'Cronos', desc: 'Cronos is Crypto.com\'s blockchain, powering one of the most popular crypto card programs with over 100M users and up to 8% CRO cashback.' },
  'linea': { name: 'Linea', desc: 'Linea is ConsenSys\'s zkEVM L2 powering the MetaMask Card. It enables direct wallet spending with sub-second transactions and minimal fees.' },
  'arbitrum': { name: 'Arbitrum', desc: 'Arbitrum is a leading Ethereum L2 with a growing DeFi ecosystem. Fiat24 operates on Arbitrum with its NFT-based banking model.' },
  'avalanche': { name: 'Avalanche', desc: 'Avalanche offers fast finality and low fees for crypto card products. The Avalanche Card leverages the chain\'s native AVAX token for rewards.' },
  'cardano': { name: 'Cardano', desc: 'Cardano\'s card ecosystem is powered by EMURGO and Wirex, offering ADA spending and up to 8% crypto cashback.' },
  'multiversx': { name: 'MultiversX', desc: 'MultiversX (formerly Elrond) powers xPortal, a crypto super app with up to 5% EGLD cashback and integrated card spending.' }
};

// Get banks for a chain
function getBanksForChain(chainKey) {
  const chainNames = {
    'solana': ['Solana'],
    'ethereum': ['Ethereum'],
    'base': ['Base'],
    'bitcoin': ['Bitcoin'],
    'scroll': ['Scroll'],
    'starknet': ['Starknet'],
    'gnosis': ['Gnosis'],
    'multi-chain': ['Multi-chain', '14 chains'],
    'bnb-chain': ['BNB Chain'],
    'cronos': ['Cronos'],
    'linea': ['Linea'],
    'arbitrum': ['Arbitrum'],
    'avalanche': ['Avalanche'],
    'cardano': ['Cardano'],
    'multiversx': ['MultiversX']
  };
  const names = chainNames[chainKey] || [chainKey];
  return banks.filter(b => names.some(n => b.chain.toLowerCase() === n.toLowerCase()));
}

// Category labels
const catLabels = {
  cryptoNative: 'Crypto-Native',
  onchain: 'Onchain',
  exchange: 'Exchange',
  fintech: 'Fintech',
  neobank: 'Neobank'
};

const custodyLabels = {
  'Non-Custodial': '🔐 Non-Custodial',
  'Custodial': '🏦 Custodial',
  'Hybrid': '🔄 Hybrid',
  'TBD': '❓ TBD'
};

// Region labels
const regionLabels = {
  global: '🌍 Global',
  americas: '🇺🇸 Americas',
  europe: '🇪🇺 Europe',
  apac: '🌏 Asia-Pacific',
  latam: '🌎 Latin America',
  india: '🇮🇳 India',
  argentina: '🇦🇷 Argentina'
};

// HTML template helpers
function head(title, description, canonical, extra = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="OnchainBanks.io">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏦</text></svg>">
<script src="https://cdn.tailwindcss.com"></script>
${extra}
</head>`;
}

function nav() {
  return `<nav class="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
<div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
  <a href="/" class="flex items-center gap-2 text-white font-bold text-lg">🏦 OnchainBanks</a>
  <div class="flex items-center gap-4 text-sm">
    <a href="/api/banks.json" class="text-gray-400 hover:text-white transition">API</a>
    <a href="https://spendbase.cards" target="_blank" class="text-lime-400 hover:text-lime-300 transition font-medium">Spendbase →</a>
  </div>
</div>
</nav>`;
}

function footer() {
  return `<footer class="border-t border-gray-800 mt-16 py-12 text-center">
<div class="max-w-7xl mx-auto px-4">
  <p class="text-gray-500 text-sm mb-2">Powered by <a href="https://spendbase.cards" class="text-lime-400 hover:text-lime-300">Spendbase</a> — Full reviews at <a href="https://spendbase.cards" class="text-lime-400 hover:text-lime-300">spendbase.cards</a></p>
  <p class="text-gray-600 text-xs">© ${new Date().getFullYear()} OnchainBanks.io · Data updated ${today}</p>
  <div class="flex justify-center gap-4 mt-4 text-xs text-gray-600">
    <a href="/sitemap.xml" class="hover:text-gray-400">Sitemap</a>
    <a href="/llms.txt" class="hover:text-gray-400">llms.txt</a>
    <a href="/api/banks.json" class="hover:text-gray-400">API</a>
  </div>
</div>
</footer>`;
}

function bankCard(bank) {
  const catColor = bank.category === 'cryptoNative' ? 'text-lime-400 bg-lime-400/10' :
                   bank.category === 'onchain' ? 'text-purple-400 bg-purple-400/10' :
                   bank.category === 'exchange' ? 'text-blue-400 bg-blue-400/10' :
                   'text-gray-400 bg-gray-400/10';
  return `<a href="/bank/${bank.slug}/" class="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition group">
  <div class="flex items-center gap-3 mb-3">
    ${bank.logo ? `<img src="${bank.logo}" alt="${bank.name}" class="w-8 h-8 rounded-lg object-contain" loading="lazy" onerror="this.style.display='none'">` : ''}
    <div>
      <h3 class="text-white font-semibold group-hover:text-lime-400 transition">${bank.name}</h3>
      <span class="text-xs ${catColor} px-1.5 py-0.5 rounded">${catLabels[bank.category] || bank.category}</span>
    </div>
  </div>
  <div class="grid grid-cols-2 gap-2 text-xs">
    <div><span class="text-gray-500">Network</span><p class="text-white">${bank.network}</p></div>
    <div><span class="text-gray-500">Chain</span><p class="text-cyan-400">${bank.chain}</p></div>
    <div><span class="text-gray-500">Cashback</span><p class="text-lime-400 font-semibold">${bank.cashback}</p></div>
    <div><span class="text-gray-500">Fee</span><p class="text-white">${bank.annualFee}</p></div>
  </div>
</a>`;
}

// ==========================================
// 1. HOMEPAGE
// ==========================================
console.log('Building homepage...');

const nonCustodialCount = banks.filter(b => b.custody === 'Non-Custodial').length;
const custodialCount = banks.filter(b => b.custody !== 'Non-Custodial').length;
const ncPercent = Math.round(nonCustodialCount / bankCount * 100);
const uniqueChains = [...new Set(banks.map(b => b.chain))].length;

// Featured = top 12 notable cards
const featuredSlugs = ['etherfi-cash', 'gnosis-pay', 'phantom-card', 'solayer-emerald', 'kast-k-card', 'ready', 'metamask-card', 'coinbase', 'nexo', 'plutus', 'binance-card', 'fold'];
const featured = featuredSlugs.map(s => banks.find(b => b.slug === s)).filter(Boolean);

const chainPageLinks = Object.entries(chainMap).map(([key, val]) => {
  const count = getBanksForChain(key).length;
  if (count === 0) return '';
  return `<a href="/chain/${key}/" class="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-cyan-500/50 transition text-center">
    <p class="text-white font-semibold">${val.name}</p>
    <p class="text-cyan-400 text-sm">${count} card${count > 1 ? 's' : ''}</p>
  </a>`;
}).filter(Boolean).join('\n');

const homepage = `${head(
  'OnchainBanks.io — The Authority on Onchain Banking',
  `Tracking ${bankCount}+ onchain banks, crypto cards, and DeFi spending products. Compare cards by chain, custody, cashback, and more.`,
  SITE,
  `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"OnchainBanks","url":"${SITE}","description":"The comprehensive database of onchain banks and crypto debit cards."}
</script>`
)}
<body class="bg-gray-950 text-gray-300 min-h-screen">
${nav()}

<!-- Hero -->
<section class="py-16 md:py-24 text-center px-4">
  <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">The Authority on<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400">Onchain Banking</span></h1>
  <p class="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Tracking ${bankCount}+ onchain banks, crypto cards, and DeFi spending products</p>
  <div class="flex flex-wrap justify-center gap-6 mb-8">
    <div class="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
      <p class="text-3xl font-bold text-white">${bankCount}</p>
      <p class="text-gray-500 text-sm">Cards Tracked</p>
    </div>
    <div class="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
      <p class="text-3xl font-bold text-white">${uniqueChains}</p>
      <p class="text-gray-500 text-sm">Chains Supported</p>
    </div>
    <div class="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
      <p class="text-3xl font-bold text-white">${ncPercent}%</p>
      <p class="text-gray-500 text-sm">Non-Custodial</p>
    </div>
  </div>
</section>

<!-- Featured Banks -->
<section class="max-w-7xl mx-auto px-4 mb-16">
  <h2 class="text-2xl font-bold text-white mb-6">Featured Onchain Banks</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    ${featured.map(bankCard).join('\n')}
  </div>
</section>

<!-- All Banks -->
<section class="max-w-7xl mx-auto px-4 mb-16">
  <h2 class="text-2xl font-bold text-white mb-6">All ${bankCount} Onchain Banks</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    ${banks.map(bankCard).join('\n')}
  </div>
</section>

<!-- By Chain -->
<section class="max-w-7xl mx-auto px-4 mb-16">
  <h2 class="text-2xl font-bold text-white mb-6">Browse by Chain</h2>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    ${chainPageLinks}
  </div>
</section>

<!-- CTA -->
<section class="max-w-4xl mx-auto px-4 mb-16 text-center">
  <div class="bg-gradient-to-r from-lime-400/10 to-cyan-400/10 border border-lime-400/20 rounded-2xl p-8">
    <h2 class="text-2xl font-bold text-white mb-3">Looking for Full Reviews?</h2>
    <p class="text-gray-400 mb-6">Spendbase provides detailed reviews, ratings, and interactive comparisons for every card.</p>
    <a href="https://spendbase.cards" target="_blank" class="inline-block bg-lime-400 text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-lime-300 transition">Visit Spendbase →</a>
  </div>
</section>

${footer()}
</body>
</html>`;

mkdir(path.join(__dirname));
fs.writeFileSync(path.join(__dirname, 'index.html'), homepage);
console.log('✓ Homepage');

// ==========================================
// 2. BANK PROFILE PAGES
// ==========================================
console.log('Building bank profiles...');

banks.forEach(bank => {
  const dir = path.join(__dirname, 'bank', bank.slug);
  mkdir(dir);

  // Find related banks (same chain or category, max 6)
  const related = banks.filter(b => b.slug !== bank.slug && (b.chain === bank.chain || b.category === bank.category)).slice(0, 6);

  const overview1 = `${bank.name} is ${bank.custody === 'Non-Custodial' ? 'a non-custodial' : bank.custody === 'Custodial' ? 'a custodial' : 'an'} onchain banking product operating on ${bank.chain}. It offers a ${bank.network} card with ${bank.cashback} cashback${bank.cashbackToken && bank.cashbackToken !== 'TBD' && bank.cashbackToken !== 'N/A' ? ` paid in ${bank.cashbackToken}` : ''}.`;
  const overview2 = `${bank.features.length > 0 ? `Key features include ${bank.features.join(', ')}.` : ''} ${bank.annualFee === '$0' ? 'The card has no annual fee, making it accessible to all users.' : `The annual fee is ${bank.annualFee}.`}`;
  const overview3 = `${bank.regions.includes('global') ? `${bank.name} is available globally` : `${bank.name} is available in ${bank.regions.map(r => regionLabels[r] || r).join(', ')}`}, supporting ${bank.network} payments at millions of merchants worldwide.`;

  const faqs = [
    { q: `Is ${bank.name} self-custody?`, a: bank.custody === 'Non-Custodial' ? `Yes, ${bank.name} is non-custodial — you maintain control of your private keys and funds at all times.` : `${bank.name} uses a ${bank.custody.toLowerCase()} model, meaning the platform manages your funds on your behalf.` },
    { q: `What cashback does ${bank.name} offer?`, a: `${bank.name} offers ${bank.cashback} cashback${bank.cashbackToken && bank.cashbackToken !== 'TBD' ? ` paid in ${bank.cashbackToken}` : ''}.` },
    { q: `What blockchain does ${bank.name} use?`, a: `${bank.name} operates on ${bank.chain}.` },
    { q: `Is there an annual fee for ${bank.name}?`, a: bank.annualFee === '$0' ? `No, ${bank.name} has no annual fee.` : `The annual fee for ${bank.name} is ${bank.annualFee}.` }
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  });

  const productSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": bank.name,
    "description": overview1,
    "url": `${SITE}/bank/${bank.slug}/`,
    "provider": { "@type": "Organization", "name": bank.name, "url": bank.website }
  });

  const page = `${head(
    `${bank.name} — Onchain Bank Profile | OnchainBanks.io`,
    `${bank.name} onchain bank profile: ${bank.network} card on ${bank.chain}, ${bank.cashback} cashback, ${bank.custody}. Compare with ${bankCount}+ crypto cards.`,
    `${SITE}/bank/${bank.slug}/`,
    `<script type="application/ld+json">${faqSchema}</script>
<script type="application/ld+json">${productSchema}</script>`
  )}
<body class="bg-gray-950 text-gray-300 min-h-screen">
${nav()}
<div class="max-w-4xl mx-auto px-4 py-8">
  <nav class="text-sm text-gray-500 mb-6"><a href="/" class="hover:text-white">Home</a> → <a href="/bank/${bank.slug}/" class="text-white">${bank.name}</a></nav>

  <div class="flex items-center gap-4 mb-6">
    ${bank.logo ? `<img src="${bank.logo}" alt="${bank.name}" class="w-12 h-12 rounded-xl object-contain" loading="lazy">` : ''}
    <div>
      <h1 class="text-3xl font-bold text-white">${bank.name} — Onchain Bank Profile</h1>
      <div class="flex gap-2 mt-1">
        <span class="text-xs px-2 py-0.5 rounded ${bank.category === 'onchain' ? 'bg-purple-400/10 text-purple-400' : bank.category === 'cryptoNative' ? 'bg-lime-400/10 text-lime-400' : 'bg-gray-400/10 text-gray-400'}">${catLabels[bank.category] || bank.category}</span>
        <span class="text-xs px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400">${bank.chain}</span>
      </div>
    </div>
  </div>

  <!-- Specs Table -->
  <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
    <table class="w-full text-sm">
      <tbody>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500 w-40">Network</td><td class="px-4 py-3 text-white font-medium">${bank.network}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Chain</td><td class="px-4 py-3 text-cyan-400">${bank.chain}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Custody</td><td class="px-4 py-3 ${bank.custody === 'Non-Custodial' ? 'text-lime-400' : 'text-white'}">${custodyLabels[bank.custody] || bank.custody}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Cashback</td><td class="px-4 py-3 text-lime-400 font-semibold">${bank.cashback}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Cashback Token</td><td class="px-4 py-3 text-white">${bank.cashbackToken}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Annual Fee</td><td class="px-4 py-3 ${bank.annualFee === '$0' ? 'text-green-400' : 'text-white'}">${bank.annualFee}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">FX Fee</td><td class="px-4 py-3 text-white">${bank.fxFee}</td></tr>
        <tr><td class="px-4 py-3 text-gray-500">Regions</td><td class="px-4 py-3 text-white">${bank.regions.map(r => regionLabels[r] || r).join(', ')}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Overview -->
  <div class="prose prose-invert max-w-none mb-8">
    <h2 class="text-xl font-bold text-white">Overview</h2>
    <p>${overview1}</p>
    <p>${overview2}</p>
    <p>${overview3}</p>
  </div>

  ${bank.features.length > 0 ? `
  <div class="mb-8">
    <h2 class="text-xl font-bold text-white mb-4">Key Features</h2>
    <div class="grid grid-cols-2 gap-3">
      ${bank.features.map(f => `<div class="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm">✦ ${f}</div>`).join('\n')}
    </div>
  </div>` : ''}

  <!-- FAQ -->
  <div class="mb-8">
    <h2 class="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
    ${faqs.map(f => `<div class="mb-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 class="text-white font-semibold mb-2">${f.q}</h3>
      <p class="text-gray-400 text-sm">${f.a}</p>
    </div>`).join('\n')}
  </div>

  <!-- CTA -->
  <div class="bg-gradient-to-r from-lime-400/10 to-cyan-400/10 border border-lime-400/20 rounded-xl p-6 text-center mb-8">
    <h2 class="text-xl font-bold text-white mb-2">Read the Full Review</h2>
    <p class="text-gray-400 mb-4">Get detailed analysis, user ratings, and comparisons on Spendbase.</p>
    <a href="${bank.spendbaseUrl}" target="_blank" class="inline-block bg-lime-400 text-gray-900 font-bold px-6 py-2.5 rounded-xl hover:bg-lime-300 transition">Read full review on Spendbase →</a>
  </div>

  <!-- Related Banks -->
  ${related.length > 0 ? `
  <div>
    <h2 class="text-xl font-bold text-white mb-4">Related Banks</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${related.map(bankCard).join('\n')}
    </div>
  </div>` : ''}
</div>
${footer()}
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), page);
});
console.log(`✓ ${bankCount} bank profiles`);

// ==========================================
// 3. COMPARISON PAGES
// ==========================================
console.log('Building comparison pages...');

const comparisons = [
  ['etherfi-cash', 'gnosis-pay'],
  ['phantom-card', 'solayer-emerald'],
  ['kast-k-card', 'ready'],
  ['nexo', 'crypto-com'],
  ['bybit', 'binance-card'],
  ['metamask-card', 'phantom-card'],
  ['plutus', 'gnosis-pay'],
  ['fold', 'coinbase'],
  ['bleap', 'holyheld'],
  ['redotpay', 'binance-card'],
  ['etherfi-cash', 'phantom-card'],
  ['solayer-emerald', 'kast-k-card'],
  ['metamask-card', 'gnosis-pay'],
  ['crypto-com', 'binance-card'],
  ['nexo', 'plutus'],
  ['coinbase', 'crypto-com'],
  ['fold', 'xapo'],
  ['ready', 'bleap'],
  ['bybit', 'crypto-com'],
  ['phantom-card', 'avici'],
  ['etherfi-cash', 'nexo'],
  ['kast-k-card', 'phantom-card'],
  ['solayer-emerald', 'ready'],
  ['gnosis-pay', 'holyheld'],
  ['metamask-card', 'coinbase'],
  ['binance-card', 'okx-card'],
  ['plutus', 'etherfi-cash'],
  ['fold', 'bitpay'],
  ['redotpay', 'kast-k-card'],
  ['bybit', 'nexo'],
  ['bleap', 'metamask-card'],
  ['solflare', 'phantom-card'],
  ['crypto-com', 'plutus'],
  ['avici', 'kast-k-card'],
  ['etherfi-cash', 'coinbase'],
  ['gnosis-pay', 'fiat24'],
  ['solayer-emerald', 'phantom-card'],
  ['binance-card', 'bybit'],
  ['nexo', 'coinbase'],
  ['ready', 'metamask-card'],
  ['fold', 'crypto-com'],
  ['holyheld', 'bleap'],
  ['kast-k-card', 'solayer-emerald'],
  ['plutus', 'bybit'],
  ['redotpay', 'revolut'],
  ['etherfi-cash', 'solayer-emerald'],
  ['phantom-card', 'fold'],
  ['wirex', 'crypto-com'],
  ['gnosis-pay', 'ready'],
  ['metamask-card', 'etherfi-cash']
];

let compCount = 0;
comparisons.forEach(([slugA, slugB]) => {
  const a = banks.find(b => b.slug === slugA);
  const b = banks.find(b => b.slug === slugB);
  if (!a || !b) return;

  const compSlug = `${slugA}-vs-${slugB}`;
  const dir = path.join(__dirname, 'compare', compSlug);
  mkdir(dir);

  function winner(field, aVal, bVal) {
    if (field === 'cashback') {
      const numA = parseFloat(aVal) || 0;
      const numB = parseFloat(bVal) || 0;
      if (numA > numB) return 'a';
      if (numB > numA) return 'b';
      return 'tie';
    }
    if (field === 'fee') {
      if (aVal === '$0' && bVal !== '$0') return 'a';
      if (bVal === '$0' && aVal !== '$0') return 'b';
      return 'tie';
    }
    if (field === 'custody') {
      if (aVal === 'Non-Custodial' && bVal !== 'Non-Custodial') return 'a';
      if (bVal === 'Non-Custodial' && aVal !== 'Non-Custodial') return 'b';
      return 'tie';
    }
    return 'tie';
  }

  const cashbackWin = winner('cashback', a.cashback, b.cashback);
  const feeWin = winner('fee', a.annualFee, b.annualFee);
  const custodyWin = winner('custody', a.custody, b.custody);

  const aWins = [cashbackWin, feeWin, custodyWin].filter(w => w === 'a').length;
  const bWins = [cashbackWin, feeWin, custodyWin].filter(w => w === 'b').length;
  const overall = aWins > bWins ? a.name : bWins > aWins ? b.name : 'Both are strong choices';
  const overallText = aWins > bWins ? `${a.name} edges ahead with better specs overall.` : bWins > aWins ? `${b.name} edges ahead with better specs overall.` : `Both cards are competitive — your choice depends on your priorities.`;

  function winClass(w, side) {
    if (w === side) return 'text-lime-400 font-bold';
    if (w === 'tie') return 'text-white';
    return 'text-gray-500';
  }

  const faqs = [
    { q: `Which has better cashback: ${a.name} or ${b.name}?`, a: cashbackWin === 'a' ? `${a.name} offers ${a.cashback} vs ${b.name}'s ${b.cashback}.` : cashbackWin === 'b' ? `${b.name} offers ${b.cashback} vs ${a.name}'s ${a.cashback}.` : `Both offer comparable cashback rates.` },
    { q: `Is ${a.name} or ${b.name} self-custody?`, a: `${a.name} is ${a.custody}, while ${b.name} is ${b.custody}.` },
    { q: `Which card has lower fees?`, a: `${a.name} charges ${a.annualFee} annually, while ${b.name} charges ${b.annualFee}.` }
  ];

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
  });

  const page = `${head(
    `${a.name} vs ${b.name} — Which Onchain Bank is Better? | OnchainBanks.io`,
    `Compare ${a.name} and ${b.name}: cashback, fees, custody, chain. Side-by-side comparison of two top onchain banks.`,
    `${SITE}/compare/${compSlug}/`,
    `<script type="application/ld+json">${faqSchema}</script>`
  )}
<body class="bg-gray-950 text-gray-300 min-h-screen">
${nav()}
<div class="max-w-4xl mx-auto px-4 py-8">
  <nav class="text-sm text-gray-500 mb-6"><a href="/" class="hover:text-white">Home</a> → <span class="text-white">${a.name} vs ${b.name}</span></nav>

  <h1 class="text-3xl font-bold text-white mb-8">${a.name} vs ${b.name} — Which Onchain Bank is Better?</h1>

  <!-- Side by Side -->
  <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-700">
          <th class="px-4 py-3 text-gray-500 text-left w-32">Spec</th>
          <th class="px-4 py-3 text-white text-left">${a.name}</th>
          <th class="px-4 py-3 text-white text-left">${b.name}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Network</td><td class="px-4 py-3 text-white">${a.network}</td><td class="px-4 py-3 text-white">${b.network}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Chain</td><td class="px-4 py-3 text-cyan-400">${a.chain}</td><td class="px-4 py-3 text-cyan-400">${b.chain}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Custody</td><td class="px-4 py-3 ${winClass(custodyWin, 'a')}">${a.custody}</td><td class="px-4 py-3 ${winClass(custodyWin, 'b')}">${b.custody}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Cashback</td><td class="px-4 py-3 ${winClass(cashbackWin, 'a')}">${a.cashback}</td><td class="px-4 py-3 ${winClass(cashbackWin, 'b')}">${b.cashback}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">Annual Fee</td><td class="px-4 py-3 ${winClass(feeWin, 'a')}">${a.annualFee}</td><td class="px-4 py-3 ${winClass(feeWin, 'b')}">${b.annualFee}</td></tr>
        <tr class="border-b border-gray-800"><td class="px-4 py-3 text-gray-500">FX Fee</td><td class="px-4 py-3 text-white">${a.fxFee}</td><td class="px-4 py-3 text-white">${b.fxFee}</td></tr>
        <tr><td class="px-4 py-3 text-gray-500">Regions</td><td class="px-4 py-3 text-white">${a.regions.map(r => regionLabels[r] || r).join(', ')}</td><td class="px-4 py-3 text-white">${b.regions.map(r => regionLabels[r] || r).join(', ')}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Verdict -->
  <div class="bg-gradient-to-r from-lime-400/10 to-cyan-400/10 border border-lime-400/20 rounded-xl p-6 mb-8">
    <h2 class="text-xl font-bold text-white mb-2">🏆 Verdict: ${overall}</h2>
    <p class="text-gray-400">${overallText}</p>
  </div>

  <!-- FAQ -->
  <div class="mb-8">
    <h2 class="text-xl font-bold text-white mb-4">FAQ</h2>
    ${faqs.map(f => `<div class="mb-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 class="text-white font-semibold mb-2">${f.q}</h3>
      <p class="text-gray-400 text-sm">${f.a}</p>
    </div>`).join('\n')}
  </div>

  <!-- CTA -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    <a href="${a.spendbaseUrl}" target="_blank" class="block bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-lime-400/50 transition">
      <p class="text-white font-semibold mb-1">${a.name} Full Review</p>
      <p class="text-lime-400 text-sm">Read on Spendbase →</p>
    </a>
    <a href="${b.spendbaseUrl}" target="_blank" class="block bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-lime-400/50 transition">
      <p class="text-white font-semibold mb-1">${b.name} Full Review</p>
      <p class="text-lime-400 text-sm">Read on Spendbase →</p>
    </a>
  </div>

  <!-- Bank profiles -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <a href="/bank/${a.slug}/" class="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition">
      <p class="text-white font-semibold">${a.name} Profile →</p>
    </a>
    <a href="/bank/${b.slug}/" class="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition">
      <p class="text-white font-semibold">${b.name} Profile →</p>
    </a>
  </div>
</div>
${footer()}
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), page);
  compCount++;
});
console.log(`✓ ${compCount} comparison pages`);

// ==========================================
// 4. CHAIN PAGES
// ==========================================
console.log('Building chain pages...');

let chainCount = 0;
Object.entries(chainMap).forEach(([key, info]) => {
  const chainBanks = getBanksForChain(key);
  if (chainBanks.length === 0) return;

  const dir = path.join(__dirname, 'chain', key);
  mkdir(dir);

  const page = `${head(
    `${info.name} Onchain Banks & Crypto Cards | OnchainBanks.io`,
    `${chainBanks.length} onchain banks and crypto cards on ${info.name}. Compare cashback, fees, and custody options.`,
    `${SITE}/chain/${key}/`
  )}
<body class="bg-gray-950 text-gray-300 min-h-screen">
${nav()}
<div class="max-w-7xl mx-auto px-4 py-8">
  <nav class="text-sm text-gray-500 mb-6"><a href="/" class="hover:text-white">Home</a> → <span class="text-white">${info.name} Cards</span></nav>

  <h1 class="text-3xl font-bold text-white mb-4">${info.name} Onchain Banks & Crypto Cards</h1>
  <p class="text-gray-400 mb-8 max-w-3xl">${info.desc}</p>

  <p class="text-gray-500 mb-6">${chainBanks.length} card${chainBanks.length > 1 ? 's' : ''} on ${info.name}</p>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    ${chainBanks.map(bankCard).join('\n')}
  </div>
</div>
${footer()}
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), page);
  chainCount++;
});
console.log(`✓ ${chainCount} chain pages`);

// ==========================================
// 5. API (banks.json)
// ==========================================
console.log('Building API...');
mkdir(path.join(__dirname, 'api'));

const apiData = {
  lastUpdated: today,
  count: bankCount,
  banks: banks.map(b => ({
    name: b.name,
    slug: b.slug,
    network: b.network,
    chain: b.chain,
    custody: b.custody,
    cashback: b.cashback,
    annualFee: b.annualFee,
    fxFee: b.fxFee,
    category: b.category,
    regions: b.regions,
    website: b.website,
    spendbaseUrl: b.spendbaseUrl
  }))
};
fs.writeFileSync(path.join(__dirname, 'api', 'banks.json'), JSON.stringify(apiData, null, 2));
console.log('✓ API');

// ==========================================
// 6. STATIC FILES
// ==========================================

// llms.txt
fs.writeFileSync(path.join(__dirname, 'llms.txt'), `# OnchainBanks.io
> The comprehensive database of onchain banks, crypto debit cards, and DeFi spending products.

## About
OnchainBanks tracks ${bankCount}+ crypto card and onchain banking products across all major chains. We provide detailed comparisons, infrastructure analysis, and industry research.

## Key Data
- ${bankCount}+ onchain banking products tracked
- Coverage across Solana, Ethereum, Base, Bitcoin, and ${uniqueChains}+ chains
- Custody analysis: ${ncPercent}% non-custodial, ${100 - ncPercent}% custodial
- Card issuer infrastructure mapping
- Funding and investment tracking

## Pages
- /bank/[name]/ - Individual bank profiles
- /compare/[bank1]-vs-[bank2]/ - Head-to-head comparisons
- /chain/[chain]/ - Banks by blockchain

## API
- /api/banks.json - Public structured data for all tracked banks

## Full Reviews
For complete reviews, ratings, and interactive comparisons, visit spendbase.cards
`);
console.log('✓ llms.txt');

// robots.txt
fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);
console.log('✓ robots.txt');

// CNAME
fs.writeFileSync(path.join(__dirname, 'CNAME'), 'onchainbanks.io\n');
console.log('✓ CNAME');

// sitemap.xml
const sitemapUrls = [
  SITE + '/',
  ...banks.map(b => `${SITE}/bank/${b.slug}/`),
  ...comparisons.map(([a, b]) => {
    const bankA = banks.find(x => x.slug === a);
    const bankB = banks.find(x => x.slug === b);
    if (!bankA || !bankB) return null;
    return `${SITE}/compare/${a}-vs-${b}/`;
  }).filter(Boolean),
  ...Object.keys(chainMap).filter(k => getBanksForChain(k).length > 0).map(k => `${SITE}/chain/${k}/`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log(`✓ sitemap.xml (${sitemapUrls.length} URLs)`);

console.log('\n🎉 Build complete!');
console.log(`  ${bankCount} bank profiles`);
console.log(`  ${compCount} comparisons`);
console.log(`  ${chainCount} chain pages`);
console.log(`  ${sitemapUrls.length} total URLs`);
