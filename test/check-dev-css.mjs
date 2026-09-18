async function check() {
  try {
    const res = await fetch('http://localhost:3000');
    const html = await res.text();
    const matches = html.match(/href="([^"]+\.css[^"]*)"/g);
    console.log('Found CSS links in HTML:', matches);
    if (matches) {
      for (const m of matches) {
        const urlPath = m.replace('href="', '').replace('"', '');
        const fullUrl = urlPath.startsWith('http') ? urlPath : 'http://localhost:3000' + urlPath;
        const cssRes = await fetch(fullUrl);
        const cssContent = await cssRes.text();
        console.log(`URL: ${urlPath}`);
        console.log(`Size: ${cssContent.length} bytes`);
        console.log(`Has flex: ${cssContent.includes('.flex')}`);
        console.log(`Has bg: ${cssContent.includes('bg-')}`);
        console.log(`Snippet: ${cssContent.slice(0, 150)}...`);
      }
    }
  } catch (err) {
    console.error('Failed to fetch from dev server:', err.message);
  }
}
check();
