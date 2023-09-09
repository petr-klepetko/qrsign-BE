const { subtle } = require("node:crypto").webcrypto;

/** *******************************************************
 * Funkce
 * */

/**
 * Equivalent function to "window.atob", which is not in node
 * @param {*} base64
 * @returns
 */
const atob = (base64) => Buffer.from(base64, "base64").toString("binary");

/**
 * Equivalent function to "window.btoa", which is not in node
 * @param {*} text
 * @returns
 */
const btoa = (text) => Buffer.from(text, "binary").toString("base64");

/**
 * Async function for signing a message
 * @param {*} privateKey
 * @param {*} message
 */
const signMessage = async (privateKey, message) => {
  /** Encode the message */
  const enc = new TextEncoder();
  const encodedMessage = enc.encode(message);

  /** Create a signature */
  const signature = await subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    encodedMessage
  );

  /** Put the signature into a Uint8Array, so it can be manipulated */
  const textSignature = new Uint8Array(signature);

  return textSignature;
};

/**
 * Async function for verifying a message
 * @param {*} publicKey
 * @param {*} signature
 * @param {*} message
 * @returns
 */
const verifyMessage = async (publicKey, signature, message) => {
  /** Encode the message */
  let enc = new TextEncoder();
  let encodedText = enc.encode(message);

  let result = await subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    encodedText
  );
  return result;
};

/*
    Convert a string into an ArrayBuffer
    from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    */
function stringToarrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * Convert an array buffer to string
 * @param {*} buffer 
 * @returns 
 */
const arrayBufferToString = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
};

/**
 * Transform (arraybuffer?) to pem format in string
 * @param {*} str
 * @returns
 */
const formatAsPem = (str) => {
  let finalString = "-----BEGIN PUBLIC KEY-----\n";

  while (str.length > 0) {
    finalString += str.substring(0, 64) + "\n";
    str = str.substring(64);
  }

  finalString = finalString + "-----END PUBLIC KEY-----";

  return finalString;
};

const spkiToPEM = (keydata) => {
  const keydataS = arrayBufferToString(keydata);
  const keydataB64 = btoa(keydataS);
  const keydataB64Pem = formatAsPem(keydataB64);
  return keydataB64Pem;
};

/**
 *
 * @param {*} exportedKey
 * @returns
 */
const privateKeyToPem = (exportedKey) => {
  const exportedAsString = String.fromCharCode.apply(
    null,
    new Uint8Array(exportedKey)
  );
  const exportedAsBase64 = btoa(exportedAsString);
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
};

/*
    Import a PEM encoded RSA private key, to use for RSA-PSS signing.
    Takes a string containing the PEM encoded key, and returns a Promise
    that will resolve to a CryptoKey representing the private key.
    */
function importPrivateKey(pem) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  );
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = stringToarrayBuffer(binaryDerString);

  return subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      // Consider using a 4096-bit key for systems that require long-term security
      modulusLength: 1024,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );
}

/*
    Import a PEM encoded RSA public key, to use for RSA-OAEP encryption.
    Takes a string containing the PEM encoded key, and returns a Promise
    that will resolve to a CryptoKey representing the public key.
    */
function importPublicKey(pem) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  );
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = stringToarrayBuffer(binaryDerString);

  return subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );
}

/** ----------------------------------------------------- */

const message = "ahoj";

/**
 * RUN :)
 */

const runMe = async () => {
  console.log("Starting...");

  const options = {
    name: "RSASSA-PKCS1-v1_5",
    // Consider using a 4096-bit key for systems that require long-term security
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  };

  /**
   * Generate keys
   */
  const keys = await subtle.generateKey(options, true, ["sign", "verify"]);

  /**
   * Export both keys to the according format
   * */
  let exportedPrivateKey = await subtle.exportKey("pkcs8", keys.privateKey);

  let exportedPublicKey = await subtle.exportKey("spki", keys.publicKey);

  /**
   * Encode both keys to .pem files
   * */
  const privatePem = privateKeyToPem(exportedPrivateKey);
  const publicPem = spkiToPEM(exportedPublicKey);

  console.log("Private key: ");
  console.log(privatePem);
  console.log("Public key: ");
  console.log(publicPem);

  /** Import both keys from .pem file */
  privateKeyImported = await importPrivateKey(privatePem);
  publicKeyImported = await importPublicKey(publicPem);

  /** Sign the message */
  // const signature = await signMessage(keys.privateKey, message);
  const signature = await signMessage(privateKeyImported, message);

  /** Make signature a string so it can be saved anywhere */
  const signatureB64 = btoa(signature.toString());
  console.log("signatureB64: ", signatureB64);

  // TODO "save the signature"

  /** Get the signature from string to Uint8Array */
  const signatureBack = atob(signatureB64);
  const array = signatureBack.split(",");
  const signatureUint8Array = new Uint8Array(array);

  /** Does not equal right away, howevever it is indeed equal if transfered toString(), and the verifying algorithm works too. */
  // console.log("signature: ", signature);
  // console.log("signatureUint8Array: ", signatureUint8Array);

  const verified = await verifyMessage(
    // keys.publicKey,
    publicKeyImported,
    signatureUint8Array,
    // signature,
    "ahoj"
  );

  console.log("verified: ", verified);
};

runMe();
