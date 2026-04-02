module.exports = {
  apps: [
    {
      name: 'backoffice',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/backoffice-copa-prete',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
