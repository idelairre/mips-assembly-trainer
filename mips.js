import { boolean, chunkSubstr, extend, sample } from './utils';
import { convertToBinary } from './binary';
import { hexToBinary } from './hex';
import number from './number';

// sub $21, $17, $13

const rFormat = {
  add: '100000',
  sub: '100010',
  and: '100100',
  or: '100101'
};

const iFormat = {
  lw: '100011',
  sw: '101011',
  beq: '000100',
  bne: '000101'
};

const invert = string => {
  return string.split('').map(i => {
    if (i === '0') {
      return '1';
    }
    return '0';
  }).join('');
}

const evenNum = () => {
  let num;
  do {
    num = number({ min: 0, max: 10 });
  } while (num % 2 !== 0);
  return num;
}

const rFormatToBin = (registers, operation) => {
  const [rd, rs, rt] = registers;
  const reg = { rd, rs, rt };
  Object.keys(reg).forEach(key => {
    let bin = parseInt(reg[key], 10).toString(2);
    while (bin.length < 5) {
      bin = '0' + bin;
    }
    reg[key] = bin;
  });
  return ['000000', reg.rs, reg.rt, reg.rd, '00000', operation].join('');
}

const iFormatToBin = (registers, operation) => {
  let [rt, rtOffset] = registers;
  let [offset, rs] = rtOffset.replace(/\(|\)/g, ' ').split(' ');
  const reg = { rs, rt, offset };
  Object.keys(reg).forEach(key => {
    let bin;
    if (key === 'offset') {
      if (reg[key] < 0) { // invert it
        bin = parseInt(Math.abs(reg[key]), 10).toString(2);
        bin = (parseInt(invert(extend(bin, 16)), 2) + 1).toString(2);
      } else {
        bin = parseInt(reg[key], 10).toString(2);
        bin = extend(bin, 16);
      }
    } else {
      bin = parseInt(reg[key], 10).toString(2);
      bin = extend(bin, 5);
    }
    reg[key] = bin;
  });
  return [operation, reg.rs, reg.rt, reg.offset].join('');
}

const convertBranchToBin = (registers, operation, instructions = false) => {
  let [rs, rd, immediate] = registers;
  const reg = { rs, rd };
  Object.keys(reg).forEach(key => {
    reg[key] = parseInt(reg[key], 10).toString(2);
  });
  if (!instructions) {
    immediate = extend((parseInt(immediate, 16) >>> 2).toString(2), 16);
  } else {
    immediate = extend((instructions.length - 2).toString(2), 16);
  }
  return [operation, reg.rs, reg.rd, immediate].join('');
}

const instructionToHex = (instruction, instructions = false) => {
  const registers = instruction.replace(/\$/g, '').split(' ');
  const operation = registers.shift();
  if (rFormat[operation]) {
    const bin = chunkSubstr(rFormatToBin(registers, rFormat[operation]), 4);
    const hex = bin.map(i => parseInt(i, 2).toString(16)).join('');
    return hex;
  } else if (iFormat[operation]) {
    let bin;
    if (operation === 'lw' || operation === 'sw') {
      bin = iFormatToBin(registers, iFormat[operation]);
    } else {
      bin = convertBranchToBin(registers, iFormat[operation], instructions);
    }
    return chunkSubstr(bin, 4).map(i => parseInt(i, 2).toString(16)).join('');
  }
}

export const generateBranch = label => {
  const iops = ['beq', 'bne'];
  let instruction = sample(iops);
  const address = label ? 'label' : `0x${extend(evenNum().toString(16), 8)}` ;
  instruction += ` $${number({ min: 0, max: 21 })}, $${number({ min: 0, max: 21 })}, ${address}`;
  return instruction;
}

export const generateLoadOrStore = () => {
  const iops = ['lw', 'sw'];
  let instruction = sample(iops);
  if (instruction === 'lw' || instruction === 'sw') {
    instruction += ` $${number({ min: 0, max: 21 })}, ${boolean() ? '-' : ''}${number({ min: 0, max: 21 })}($${number({ min: 0, max: 21 })})`;
  }
  return instruction;
}

export const generateRType = () => {
  const rops = ['add', 'sub', 'and', 'or'];
  return `${sample(rops)} $${number({ min: 0, max: 21 })}, $${number({ min: 0, max: 21 })}, $${number({ min: 0, max: 21 })}`;
}

export const generateIType = () => {
  return generateLoadOrStore();
}

export const generateInstruction = () => {
  if (boolean()) {
    return generateIType();
  } else {
    return generateRType();
  }
}

export const generateInstructions = () => {
  const instructions = [];
  instructions.push(generateBranch(true));
  const len = number({ min: 4, max: 11 });
  for (let i = 0; i < len; i += 1) {
    let instruction = boolean() ? generateRType() : generateLoadOrStore();
    if (i === len - 1) {
      instruction = `label: ${instruction}`;
    }
    instructions.push(instruction);
  }
  return instructions;
}

export default instructionToHex;
