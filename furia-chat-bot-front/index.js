const { join } = require('path');
const express = require('express');

// IMPORTANDO O APP SSR DO ANGULAR
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../dist/furia-chat-bot-front/server/main.server');
const { ngExpressEngine } = require('@nguniversal/express-engine');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

const app = express();
const distFolder = join(process.cwd(), 'dist/furia-chat-bot-front/browser');
const indexHtml = 'index.html';

// ENGINE UNIVERSAL DO ANGULAR
app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [provideModuleMap(LAZY_MODULE_MAP)],
}));

app.set('view engine', 'html');
app.set('views', distFolder);

// SERVE ARQUIVOS ESTÁTICOS
app.get('*.*', express.static(distFolder, {
    maxAge: '1y'
}));

// SSR UNIVERSAL
app.get('*', (req, res) => {
    res.render(indexHtml, { req });
});

module.exports = app;