import CryptoJS from "crypto-js";
var IV = "8NONwyJtHesysWpM";
var KEY = "1234567898882222";
var key = CryptoJS.enc.Utf8.parse(KEY);
var iv = CryptoJS.enc.Utf8.parse(IV);

export const Encrypt = (data) => {
  let encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

export const Decrypt = (data) => {
  let decrypted = CryptoJS.AES.decrypt(data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};
