const fs = require('fs');

async function compare() {
  const localHtml = fs.readFileSync('portfolio-editor.html', 'utf8');
  const res = await fetch('https://milan-portfolio-website.vercel.app/portfolio-editor.html', {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const remoteHtml = await res.text();

  console.log('Local length:', localHtml.length);
  console.log('Remote length:', remoteHtml.length);
  console.log('Exact match:', localHtml === remoteHtml);

  if (localHtml !== remoteHtml) {
    console.log('Differences found! Finding where it differs...');
    const localLines = localHtml.split('\n');
    const remoteLines = remoteHtml.split('\n');
    console.log('Local line count:', localLines.length);
    console.log('Remote line count:', remoteLines.length);
    for (let i = 0; i < Math.max(localLines.length, remoteLines.length); i++) {
      if (localLines[i] !== remoteLines[i]) {
        console.log(`Diff at line ${i + 1}:`);
        console.log('Local :', localLines[i]);
        console.log('Remote:', remoteLines[i]);
        break;
      }
    }
  }
}
compare();
