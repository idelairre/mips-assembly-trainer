import { generateHex as hex, binToHex, hexToBinary } from './hex';
import number from './number';
import toBin from './binary';
import { boolean, chunkSubstr, createDuplicates, extend, sample } from './utils';

// Block Size = 2^5 = 32
// # blocks = 2^17
// 8 way SA = 2^3

const sets = [2, 4, 8];

const num = ({ min = 3, max = 12 } = {}) => {
  return 2 ** number({ min, max });
}

const nway = () => {
  return sets[number({ min: 0, max: 2 })];
}

const generateCache = ({ test = false } = {}) => {
  const cache = {
    blockSize: num(),
    blocks: num()
  };
  if (!!number({ min: 0, max: 1 })) {
    cache.sa = nway();
    if (Math.log2(cache.sa) === Math.log2(cache.blocks)) {
      do {
        cache.blocks = num();
      } while (Math.log2(cache.sa) > Math.log2(cache.blocks));
    }
  }

  return cache;
}

export const getAddressBits = (address, cache, silent = false) => {

  const { offsetBits, setBits, tagBits } = getAddressBitPartition(cache);

  if (!silent) {
    console.log(`\nset #: ${setBits} bits`);
    console.log(`offset: ${offsetBits} bits`);
    console.log(`tag: ${tagBits} bits`);
  }

  const bin = extend(parseInt(address, 16).toString(2), 32);

  const offsetBitmask = (1 << offsetBits) - 1;
  const setBitmask = ((1 << setBits) - 1) << offsetBits;

  const tag = parseInt(address, 16) >>> (offsetBits + setBits);
  const set = (parseInt(address, 16) & setBitmask) >>> offsetBits;
  const offset = parseInt(address, 16) & offsetBitmask;

  return {
    tag: tag.toString(16),
    offset: offset.toString(16),
    set: set.toString(16)
  };
}

export const getAddressBitPartition = cache => {
  const offsetBits = Math.log2(cache.blockSize);
  const setBits = cache.sa ? Math.log2(cache.blocks) - Math.log2(cache.sa) : Math.log2(cache.blocks);
  const tagBits = 32 - (setBits + offsetBits);
  return { offsetBits, setBits, tagBits };
}

export const generateCacheAddresses = cache => {
  const { tagBits, setBits, offsetBits } = getAddressBitPartition(cache);
  const tags = [];
  const sets = [];
  const offsets = [];
  const addresses = [];

  // generate tags
  for (let i = 0; i < 8; i += 1) {
    tags.push(number({ min: 0, max: 2 ** tagBits }));
  }

  // generate sets

  for (let i = 0; i < 8; i += 1) {
    sets.push(number({ min: 0, max: 2 ** setBits }));
  }

  // generate offets

  for (let i = 0; i < 8; i += 1) {
    offsets.push(number({ min: 0, max: 2 ** offsetBits }));
  }

  for (let i = 0; i < 8; i += 1) {
    const address = extend([toBin(tags[i]), toBin(sets[i]), toBin(offsets[i])].join(''), 32);
    addresses.push(binToHex(address));
  }

  for (let i = 0; i < 8; i += 1) {
    if (boolean()) {
      const { tag, offset, set } = getAddressBits(sample(addresses), cache, true);
      const address = getAddressBits(addresses[i], cache, true);
      address.tag = tag;
      address.set = set;
      addresses[i] = binToHex(extend([toBin(parseInt(address.tag, 16)), toBin(parseInt(address.set, 16)), toBin(parseInt(address.offset, 16))].join('')), 32);
    }
  }

  return addresses;
}

export const getCacheHits = (addresses, cache) => {
  const hits = addresses.reduce((map, address) => {
    map[address] = 'miss';
    return map;
  }, {});

  if (!cache.sa) {
    const cacheSim = {};
    addresses.forEach((address, index) => {
      const bits = getAddressBits(address, cache, true);
      if (index === 0) {
        hits[address] = 'miss';
      } else {
        if (cacheSim.hasOwnProperty(bits.set) && cacheSim[bits.set] === bits.tag) {
          hits[address] = 'hit';
        }
      }
      // direct map caches bump out cached blocks
      cacheSim[bits.set] = bits.tag;
    });
  } else {
    const caches = [];
    for (let i = 0; i < cache.sa; i+= 1) {
      caches.push({ });
    }
    addresses.forEach((address, index) => {
      const bits = getAddressBits(address, cache , true);
      if (index === 0) {
        hits[address] = 'miss';
      } else {
        caches.forEach(set => {
          if (set.hasOwnProperty(bits.set) && set[bits.set] === bits.tag) {
            hits[address] = 'hit';
          }
        });
      }
      for (let i = 0; i < caches.length - 1; i += 1) {
        if (!caches[i].hasOwnProperty(bits.set)) {
          caches[i][bits.set] = bits.tag;
          break;
        } else if (caches[i].hasOwnProperty(bits.set) && caches[i][bits.set] !== bits.tag) {
          continue;
        }
      }
    });
  }
  return hits;
}


export default generateCache;
