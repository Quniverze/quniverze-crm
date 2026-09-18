async function inspectClasses() {
  const res = await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__0lmwkos._.css');
  const css = await res.text();
  const testClasses = [
    'flex',
    'h-screen',
    'bg-[#F7F7F5]',
    'border-[#E5E5E5]',
    'border-b',
    'text-[#111111]',
    'page-title',
    'section-label',
    'big-metric'
  ];
  console.log('--- CHECKING CLASSES IN SERVED CSS ---');
  testClasses.forEach(cls => {
    console.log(`Class "${cls}": ${css.includes(cls) ? 'FOUND' : 'MISSING'}`);
  });
}
inspectClasses();
