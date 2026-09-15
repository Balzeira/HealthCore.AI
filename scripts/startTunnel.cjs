const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function main() {
  const urlFile = path.join(__dirname, 'tunnel_url.txt');

  const ssh = spawn('ssh', [
    '-p', '443',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=30',
    '-R0:localhost:5173',
    'free.pinggy.io'
  ]);

  let captured = false;

  const handleData = (chunk) => {
    const text = chunk.toString();
    console.log(text);
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.(?:free\.pinggy\.link|a\.pinggy\.link|pinggy\.link)/);
    if (match && !captured) {
      captured = true;
      const cleanUrl = match[0].trim();
      console.log('=== PINGGY TUNNEL URL ===\n' + cleanUrl);
      fs.writeFileSync(urlFile, cleanUrl, 'utf8');
    }
  };

  ssh.stdout.on('data', handleData);
  ssh.stderr.on('data', handleData);
  ssh.on('close', (code) => console.log('Pinggy closed with code', code));
  ssh.on('error', (err) => console.error('Pinggy error:', err));

  setInterval(() => {}, 1000 * 60 * 60);
}

main();
