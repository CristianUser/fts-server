import fs from 'fs';
import jsYaml from 'js-yaml';
import path from 'path';

/**
 * Generate router path
 * @param {string} file entity name
 * @returns {string} path
 */
export function generatePrefix(file: string) {
  const fileDir = 'src/api';

  return file.substring(file.indexOf(fileDir) + fileDir.length).split('/').filter(part => !part.includes('.ts')).join('/');
}

/**
 * Parse the yaml to json object
 *
 * @param {string} file filepath
 * @returns {object} json
 */
export function parseYaml(file: string) {
  return jsYaml.load(fs.readFileSync(path.resolve(file), 'utf8'));
}

/**
 * Convert Windows backslash paths to slash paths: `foo\\bar` ➔ `foo/bar`.
 * @param {string} pathStr - A Windows backslash path.
 * @returns {string} A path with forward slashes.
 */
export function standarizePath(pathStr: string): string {
  const isExtendedLengthPath = /^\\\\\?\\/.test(pathStr);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(pathStr);

  if (isExtendedLengthPath || hasNonAscii) {
    return pathStr;
  }

  return pathStr.replace(/\\/g, '/');
}

/**
 * Extract entity name from folder
 * @param {string} file filepath
 * @returns {string}
 */
export function getEntityName(file: string): string {
  return standarizePath(file)
    .split('/')
    .reverse()[0].split('.')[0];
}

/**
 * Parses Json in a secure way
 *
 * @param {string} str
 * @returns {object}
 */
export function parseJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch (error) {
    return str;
  }
}

/**
 * Resolve file name by filepath
 * @param {string} file filepath
 * @returns {string}
 */
export function getFilename(file: string = ''): string {
  return (file.split('/').pop()|| '').split('.')[0];
}

/**
 * Validate UUID with a regex
 *
 * @param {string} uuid
 * @returns {boolean}
 */
export function validUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuid ? regex.test(uuid): false;
}
