import generateNumber from './number';
import toBin from './binary';

const HEX = {
  10: 'A',
  11: 'B',
  12: 'C',
  13: 'D',
  14: 'E',
  15: 'F'
};

const numbers = {};

Object.keys(HEX).forEach(key => {
  numbers[HEX[key]] = key;
});

export const generateHex = (length = 1) => {
  let arr = new Array(length);
  for (let i = 0; i < arr.length; i += 1) {
    arr[i] = generateNumber({ min: 0, max: 15 });
  }
  arr = arr.map(i => {
    if (i >= 10) {
      i = HEX[i];
    }
    return i;
  });
  return arr.join('').toLowerCase();
}

export const hexToBinary = hex => {
  const arr = [];
  for (let i = 0; hex.length > i; i += 1) {
    let bin = parseInt(hex[i], 16).toString(2);
    while (bin.length < 4) {
      bin = '0' + bin;
    }
    arr.push(bin);
  }
  return arr.join(' ');
}

export const binToHex = binaryString => {
   let output = '';

   // For every 4 bits in the binary string
   for (let i= 0; i < binaryString.length; i+= 4) {
       // Grab a chunk of 4 bits
       const bytes = binaryString.substr(i, 4);

       // Convert to decimal then hexadecimal
       const decimal = parseInt(bytes, 2);
       const hex = decimal.toString(16);

       // Uppercase all the letters and append to output
       output += hex.toUpperCase();
   }

   return output;
}

export const decToHex = num => {
  if (num < 0) {
    return (0xFF + num + 1).toString(16);
  }
  return num.toString(16);
}
