const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const urlFile = path.join(__dirname, 'tunnel_url.txt');

console.log('🚀 Iniciando túnel via localhost.run...');

const ssh = spawn('ssh', [
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'ServerAliveInterval=30',
  '-o', 'ConnectTimeout=15',
  '-R', '80:localhost:5173',
  'localhost.run'
]);

let captured = false;

const handleData = (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  // localhost.run prints URLs like: https://xxxx.localhost.run
  const match = text.match(/https?:\/\/[a-zA-Z0-9-]+\.localhost\.run/);
  if (match && !captured) {
    captured = true;
    const url = match[0].trim();
    console.log('\n✅ LINK PÚBLICO GERADO:\n' + url + '\n');
    fs.writeFileSync(urlFile, url, 'utf8');
  }
};

ssh.stdout.on('data', handleData);
ssh.stderr.on('data', handleData);
ssh.on('close', (code) => console.log('Túnel encerrado, código:', code));
ssh.on('error', (err) => console.error('Erro:', err.message));

// Mantém o processo vivo
setInterval(() => {}, 1000 * 60 * 60);
