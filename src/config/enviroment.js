const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const ENVIRONMENT = process.env.NODE_ENV || 'local';
switch (ENVIRONMENT) {
  case 'development': {
    if (fs.existsSync(path.join(process.cwd(), '/.env.development'))) {
      dotenv.config({ path: '.env.development' });
    }
    else {
      console.log('Unable to find Environment File');
      process.exit(1);
    }
    break;
  }
  case 'staging': {
    if (fs.existsSync(path.join(process.cwd(), '/.env.staging'))) {
      dotenv.config({ path: '.env.staging' });
    }
    else {
      process.exit(1);
    }
    break;
  }
  case 'pre-prod': {
    if (fs.existsSync(path.join(process.cwd(), '/.env.pre-prod'))) {
      dotenv.config({ path: '.env.pre-prod' });
    }
    else {
      process.exit(1);
    }
    break;
  }
  case 'production': {
    if (fs.existsSync(path.join(process.cwd(), '/.env.production'))) {
      dotenv.config({ path: '.env.production' });
    }
    else {
      process.exit(1);
    }
    break;
  }
  default: {
    if (fs.existsSync(path.join(process.cwd(), '/.env'))) {
      dotenv.config({ path: '.env' });
    }
    else {
      process.exit(1);
    }
  }
}
