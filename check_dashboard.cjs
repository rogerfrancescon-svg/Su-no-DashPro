const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });
  page.on('pageerror', error => console.log('PAGE EXCEPTION:', error.message));
  
  console.log("Navigating to http://localhost:3000...");
  await page.goto('http://localhost:3000');
  
  // Set mock data
  await page.evaluate(() => {
    localStorage.setItem('@agridash_integrados', JSON.stringify([
      { id: '1', name: 'João', alojamentoDate: '2026-07-01', status: 'Em andamento' },
      { id: '2', name: 'Maria', alojamentoDate: '2026-07-01', status: 'Fechado' }
    ]));
    localStorage.setItem('@agridash_visits', JSON.stringify([
      { id: 'v1', date: '2026-07-08', integradoId: '1', idade: 7, animaisAlojados: 1000, animaisMortos: 5, consumoAcumuladoReal: 100, mortalidade: 0.5 },
      { id: 'v2', date: '2026-07-08', integradoId: '2', idade: 7, animaisAlojados: null, animaisMortos: null, consumoAcumuladoReal: null }
    ]));
    window.dispatchEvent(new CustomEvent('offline-login'));
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
