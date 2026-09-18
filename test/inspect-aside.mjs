async function inspectAside() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__1ba7kql._.css');
  const css = await res.text();
  console.log('--- CSS INSPECTION ---');
  ['hidden', 'md:flex', 'flex-shrink-0', 'w-[220px]', 'flex-1', 'overflow-hidden'].forEach(term => {
    const idx = css.indexOf(term);
    console.log(`Term "${term}": ${idx !== -1 ? 'FOUND' : 'MISSING'}`);
  });
  
  // Print media query section
  const mdIdx = css.indexOf('@media (min-width: 48rem)');
  if (mdIdx !== -1) {
    console.log('\n--- @media (min-width: 48rem) SNIPPET ---');
    console.log(css.slice(mdIdx, mdIdx + 600));
  } else {
    const mdIdx2 = css.indexOf('min-width');
    console.log('min-width occurrences:', css.match(/@media[^{]+\{/g));
  }
}
inspectAside();
