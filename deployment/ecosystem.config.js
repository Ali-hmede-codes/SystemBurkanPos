const path = require('path');

module.exports = {
  apps: [
    {
      name: 'burkanpos-backend',
      script: './server.js',
      cwd: path.join(__dirname, '..', 'pos-backend'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5555,
      },
    },
  ],
};
