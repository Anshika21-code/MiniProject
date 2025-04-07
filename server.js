// common core modules 
const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const EventEmitter = require('events')
const logEvents = require('./LogEvent')

class Emitter extends EventEmitter {}
const myEmitter = new Emitter()

myEmitter.on('log', (msg, logName) => logEvents)
const PORT = process.env.PORT || 3500;

const serveFile = async (filePath, contentType, res) => {
    try {
        const data = await fsPromises.readFile(filePath, contentType.includes('text') ? 'utf8' : '');
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (error) {
        console.log(error);
        res.writeHead(500);
        res.end('Server Error');
    }
};

const server = http.createServer(async (req, res) => {
    console.log(req.method, req.url)
    myEmitter.emit('log', `${req.method} ${req.url}`,'reqlog.txt')


    const extension = path.extname(req.url);
    let contentType;

    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    let filePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'views', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'application/json'
                    ? path.join(__dirname, 'data', req.url)
                    : path.join(__dirname, req.url);

    if (!extension && req.url.slice(-1) !== '/') filePath += '.html';

    try {
        if (fs.existsSync(filePath)) {
            await serveFile(filePath, contentType, res);
        } else {
            // Handle redirects or 404
            switch (path.parse(filePath).base) {
                case 'old-page.html':
                    res.writeHead(301, { 'Location': '/new-page.html' });
                    res.end();
                    break;
                case 'www-page.html':
                    res.writeHead(301, { 'Location': 'https://www.google.com' });
                    res.end();
                    break;
                default:
                    await serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res);
            }
        }
    } catch (err) {
        console.log(err);
        res.writeHead(500);
        res.end('Server Error');
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
