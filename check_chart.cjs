const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    localStorage.setItem('@agridash_integrados', JSON.stringify([
      { id: '1', name: 'João', alojamentoDate: '2026-07-01', status: 'Em andamento' }
    ]));
    localStorage.setItem('@agridash_visits', JSON.stringify([
      { id: 'v1', date: '2026-07-08', integradoId: '1', idade: 7, animaisAlojados: 1000, animaisMortos: 5, consumoAcumuladoReal: 15, mortalidade: 0.5 },
      { id: 'v2', date: '2026-07-15', integradoId: '1', idade: 14, animaisAlojados: 1000, animaisMortos: 10, consumoAcumuladoReal: 28, mortalidade: 1.0 }
    ]));
    window.dispatchEvent(new CustomEvent('offline-login'));
  });

  await new Promise(r => setTimeout(r, 2000));
  
  const hasLine = await page.evaluate(() => {
    return !!document.querySelector('.recharts-line');
  });
  
  const hasArea = await page.evaluate(() => {
    return !!document.querySelector('.recharts-area');
  });
  
  console.log('HAS LINE:', hasLine);
  console.log('HAS AREA:', hasArea);
  
  await browser.close();
})();
