import { rand } from './mersenne';

const generateNumber = ({ min = 0, max = 99999, precision = 1 } = {}) => {
  // Make the range inclusive of the max value
  if (max >= 0) {
    max += precision;
  }

  return precision * Math.floor(rand(max / precision, min / precision));
}

export default generateNumber;
