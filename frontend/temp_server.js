const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const DIRECTORY = __dirname;

const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    let filePath = path.join(DIRECTORY, url === '/' ? 'index.html' : url);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        let ext = path.extname(filePath);
        let contentType = 'text/html';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'text/javascript';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
