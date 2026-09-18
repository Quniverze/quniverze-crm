async function inspectHtml() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log('--- HTML TITLE ---');
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'No title tag');
  console.log('--- FIRST 500 CHARS OF BODY ---');
  const bodyIdx = html.indexOf('<body');
  console.log(html.slice(bodyIdx, bodyIdx + 500));
}
inspectHtml();
