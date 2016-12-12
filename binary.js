const convertToBinary = dec => {
  let resp = (dec >>> 0).toString(2);
  while (resp.length < 4) {
    resp = '0' + resp;
  }
  return resp;
}

export default convertToBinary;
