import mersenne from './mersenne';
import number from './number';

export function boolean() {
  return Boolean(number({ min: 0, max: 1 }));
};

export function chunkSubstr(str, size = 4) {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

export function extend(string, length = 32) {
  while (string.length < length) {
    string = '0' + string;
  }
  return string;
}

export function sample(array) {
  const index = Math.floor(number({ min: 0, max: array.length - 1 }));
  return array[index];
};

export function createDuplicates(array) {
  const source = sample(array);
  for (let i = 0; i < number({ min: 0, max: array.length - 1 }); i += 1) {
    if (boolean()) {
      array[i] = source;
    }
  }
  console.log(array);
  return array;
}
