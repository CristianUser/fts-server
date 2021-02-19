import dotenv from 'dotenv';
const envVars: any = {};

function parseValue(value: string): any {
  if (['true', 'false'].includes(value.toLowerCase())) {
    return value !== 'false'
  }
  if (!Number.isNaN(parseFloat(value))) {
    return parseFloat(value);
  }

  return value;
}

export function init() {
  const { parsed } = dotenv.config();

  for (const key in parsed) {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      const value = parsed[key];
      
      process.env[key] = parseValue(value);
      envVars[key] = parseValue(value);
    }
  }
}

export function get(key:string, defaultValue?: any): any {
  return envVars[key] || process.env[key] || defaultValue;
}


export default {
  init,
  get
}
