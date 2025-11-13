#!/usr/bin/env node

/**
 * Script para rodar testes E2E com API iniciada automaticamente
 */

import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

let apiProcess = null;

async function checkApiHealth() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function startApi() {
  console.log('🚀 Iniciando API...');

  apiProcess = spawn('npm', ['start'], {
    cwd: './apps/api',
    shell: true,
    stdio: 'pipe'
  });

  // Aguardar API iniciar (max 10s)
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    if (await checkApiHealth()) {
      console.log('✅ API iniciada com sucesso!\n');
      return true;
    }
  }

  console.error('❌ Timeout: API não iniciou em 10s');
  return false;
}

async function runTests() {
  console.log('🧪 Rodando testes E2E...\n');

  const testProcess = spawn('npx', ['playwright', 'test'], {
    shell: true,
    stdio: 'inherit'
  });

  return new Promise((resolve) => {
    testProcess.on('close', (code) => {
      resolve(code);
    });
  });
}

async function cleanup() {
  if (apiProcess) {
    console.log('\n🛑 Parando API...');
    apiProcess.kill();
  }
}

async function main() {
  try {
    // Verificar se API já está rodando
    if (await checkApiHealth()) {
      console.log('ℹ️  API já está rodando\n');
    } else {
      const started = await startApi();
      if (!started) {
        process.exit(1);
      }
    }

    // Rodar testes
    const exitCode = await runTests();

    // Cleanup
    await cleanup();

    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Erro:', error);
    await cleanup();
    process.exit(1);
  }
}

// Handle CTRL+C
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Interrompido pelo usuário');
  await cleanup();
  process.exit(130);
});

main();
