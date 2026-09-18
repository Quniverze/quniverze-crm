async function checkFlexRule() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__1ba7kql._.css');
  const css = await res.text();
  const flexIdx = css.indexOf('.flex {');
  if (flexIdx !== -1) {
    console.log(css.slice(flexIdx, flexIdx + 100));
  } else {
    const idx2 = css.indexOf('.flex');
    console.log('Flex occurrences:', css.slice(idx2, idx2 + 100));
  }
}
checkFlexRule();
