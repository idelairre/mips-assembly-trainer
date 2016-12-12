import inquirer from 'inquirer';
import decToBin from './binary';
import { decToHex, generateHex, hexToBinary } from './hex';
import generateCache, { getAddressBitPartition, getCacheHits, generateCacheAddresses } from './cache';
import generateNumber from './number';
import convertToBinary from './binary';
import instructionToHex, { generateInstruction, generateInstructions } from './mips';

const questions = [{
  type: 'list',
  name: 'response',
  message: 'What would you like to work on?',
  choices: [{
    value: 'twosCompliment',
    name: 'two\'s complement'
  }, {
    value: 'dec2hex',
    name: 'converting decimal to hex'
  }, {
    value: 'dec2bin',
    name: 'converting decimal to binary'
  }, {
    value: 'hex2binary',
    name: 'converting hex to binary'
  }, {
    value: 'bin2hex',
    name: 'converting binary to hex'
  }, {
    value: 'mips2bin',
    name: 'converting MIPS to binary'
  }, {
    value: 'mips2hex',
    name: 'converting MIPS to hex'
  }, {
    value: 'branchInstructionToHex',
    name: 'converting branching instructions to hex'
  }, {
    value: 'cacheAddress',
    name: 'composing tag, slot number, and block offset from an address'
  }, {
    value: 'cacheHit',
    name: 'determining cache hits and misses'
  }]
}];

const trainer = {
  twosCompliment() {
    const num = -generateNumber({ min: 0, max: 100 });
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `find the two's compliment of the the following number: ${num}`
    }).then(response => {
      console.log(`Correct? ${response.answer === decToHex(num)}, ${decToHex(num)}`);
      return this.twosCompliment();
    });
  },
  dec2Hex() {
    const num = generateNumber({ min: 0, max: 1000 });
    const hex = decToHex(num);
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Convert ${num} to hex`,
    }).then(response => {
      console.log(`Correct? ${response.answer === hex}, ${hex}`);
      return this.dec2hex();
    });
  },
  dec2bin() {
    const num = generateNumber({ min: 0, max: 1000 });
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Convert ${num} to binary`,
    }).then(response => {
      console.log(`Correct? ${response.answer === convertToBinary(num)}, ${convertToBinary(num)}`);
      return this.dec2bin();
    });
  },
  hex2binary() {
    const hex = generateHex();
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Convert 0x${hex.toUpperCase()} to binary`,
    }).then(response => {
      console.log(`Correct? ${response.answer === hexToBinary(hex)}, ${hexToBinary(hex)}`);
      return this.hex2binary();
    });
  },
  bin2hex() {
    const hex = generateHex();
    const bin = hexToBinary(hex);
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Convert ${bin} to hex`,
    }).then(response => {
      console.log(`Correct? ${response.answer === hex}, ${hex}`);
      return this.bin2hex();
    });
  },
  mips2bin() {
    console.log('mips2bin');
  },
  mips2hex() {
    const instruction = generateInstruction();
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Convert ${instruction} to hex`,
    }).then(response => {
      console.log(`Correct? ${response.answer === instructionToHex(instruction)}, ${instructionToHex(instruction)}`);
      return this.mips2hex();
    });
  },
  branchInstructionToHex() {
    const instructions = generateInstructions();
    console.log('\n');
    for (const inst in instructions) {
      console.log(instructions[inst]);
    }
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Convert the branch instruction in the above sequence to hex:`
    }).then(response => {
      const hex = instructionToHex(instructions[0], instructions);
      console.log(`Correct? ${response.answer === hex}, ${hex}`);
      return this.branchInstructionToHex();
    });
  },
  cacheAddress() {
    const cache = generateCache();
    const address = generateHex(8);
    inquirer.prompt({
      type: 'input',
      name: 'answer',
      message: `Given the following architecture:\n
      block size: 2 ^ ${Math.log2(cache.blockSize)}\n
      blocks: 2 ^ ${Math.log2(cache.blocks)}\n
      ${cache.sa ? cache.sa + '-way SA' : 'direct mapped'}
      give the tag, set # and offset of the following address: ${address}`,
    }).then(response => {
      const [answerTag, answerSet, answerOffset] = response.answer.split(' ');
      const { tag, set, offset } = getAddressBits(address, cache);

      let correct = false;
      if (parseInt(answerTag, 16) === parseInt(tag, 16) && parseInt(answerSet, 16) === parseInt(set, 16) && parseInt(answerOffset, 16) === parseInt(offset, 16)) {
        correct = true;
      }
      console.log('Correct?', correct);
      console.log('\ntag: ', tag);
      console.log('set: ', set);
      console.log(`offset: ${offset}\n`);
      return this.cacheAddress();
    });
  },
  cacheHit() {
    // const testAddresses = ['E879F0', 'e879f4', 'a399f4', 'a499fc', 'a479f8', 'e879f8', 'e879fc', 'a399Fc'];
    // const testCache = { blockSize: 16, blocks: 2 ** 12, sa: 2 };
    const cache = generateCache();
    const addresses = generateCacheAddresses(cache);
    const hits = getCacheHits(addresses, cache);
    inquirer.prompt({
      type: 'checkbox',
      name: 'answer',
      message: `Given the following architecture:\n
      block size: 2 ^ ${Math.log2(cache.blockSize)}\n
      blocks: 2 ^ ${Math.log2(cache.blocks)}\n
      ${cache.sa ? cache.sa + '-way SA' : 'direct mapped'}
      determine which of the following addresses are hits (assume that initially the cache is empty but then the following memory references occur one after another): ${addresses}`,
      choices: addresses
    }).then(response => {
      let correct = true;
      for (let i = 0; i < response.answer.length - 1; i += 1) {
        if (hits[response.answer[i]] !== 'hit') {
          correct = false;
        }
      }
      console.log('Correct?', correct);
      console.log('Hits: ', '\n', hits);
      return this.cacheHit();
    });
  }
};

inquirer.prompt(questions).then(answers => {
  trainer[answers.response]();
});
