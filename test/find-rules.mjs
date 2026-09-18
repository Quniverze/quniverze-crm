async function findRules() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__0lmwkos._.css');
  const css = await res.text();
  const lines = css.split(/[;{}]/);
  const matched = lines.filter(l => l.includes('e5e5e5') || l.includes('f7f7f5') || l.includes('111111'));
  console.log('Matched snippets:', matched.slice(0, 10));
}
findRules();
