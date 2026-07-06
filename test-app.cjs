const { JSDOM } = require('jsdom');
const express = require('express');
const app = express();
app.use(express.static('dist'));
const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log('Server running on port ' + port);
  const dom = await JSDOM.fromURL(`http://localhost:${port}/`, {
    runScripts: "dangerously",
    resources: "usable"
  });
  
  dom.window.addEventListener('error', (event) => {
    console.error('Window error:', event.error);
  });
  dom.window.console.error = (...args) => console.error('Console error:', ...args);
  
  setTimeout(() => {
    console.log("App HTML:", dom.window.document.getElementById('root').innerHTML);
    const errors = dom.window.document.querySelector('.error');
    if(errors) console.log(errors.innerHTML);
    server.close();
    process.exit(0);
  }, 4000);
});
