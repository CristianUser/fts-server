import glob from 'glob';
import path from 'path';

type IGetFilesCb = (mod: string) => void;

/**
 * Uses glob to locate files from pattern
 * @param {string} pattern
 * @param {Function} each forEach callback
 */
export function getFiles(pattern: string, each?: IGetFilesCb): string[]  {
  const files = glob.sync(pattern).map(_path => path.resolve(_path));

  if (each) files.forEach(each);
  return files;
}

