async function checkWidth() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__1ba7kql._.css');
  const css = await res.text();
  const idx = css.indexOf('220px');
  console.log('--- 220px RULE ---');
  console.log(css.slice(idx - 30, idx + 50));
}
checkWidth();
