
export const initialFiles = {
    'package.json': {
        file: {
            contents: JSON.stringify({
                name: 'my-web-server',
                type: 'module',
                dependencies: {},
                scripts: {
                    start: 'node index.js'
                }
            }, null, 2),
        },
    },
    'index.js': {
        file: {
            contents: `import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(\`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My WebContainer Live Preview</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          max-width: 500px;
          width: 90%;
        }
        h1 {
          font-size: 2.5rem;
          background: linear-gradient(to right, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }
        p {
          color: #94a3b8;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }
        .card {
          margin-top: 2rem;
          padding: 1.25rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: left;
        }
        .card-title {
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .card-body {
          color: #94a3b8;
          font-size: 0.875rem;
          font-family: monospace;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="status-badge">● Live Preview Server Active</span>
        <h1>Hello World!</h1>
        <p>Your browser-based IDE is fully working! Any changes you make to index.js on the left will update here.</p>
        
        <div class="card">
          <div class="card-title">💡 Quick Test:</div>
          <div class="card-body">
            1. Edit the "Hello World!" heading in index.js.<br/>
            2. Press Ctrl+C in the terminal below.<br/>
            3. Run <strong>npm start</strong> to restart and see the changes!
          </div>
        </div>
      </div>
    </body>
    </html>
  \`);
});

const port = 3000;
server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`,
        },
    },
};