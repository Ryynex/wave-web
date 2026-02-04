/* src/utils/cryptoUtils.js */

// Helper to convert strings/buffers
const enc = new TextEncoder();
const dec = new TextDecoder();

function buffToB64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function b64ToBuff(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

/**
 * Replicates Dart's key derivation loop
 */
export async function deriveKeyWorker(password, salt) {
  const initialInput = enc.encode(`${password}${salt}`);
  let currentHash = await crypto.subtle.digest("SHA-256", initialInput);

  // Replicate the 100,000 iterations loop
  for (let i = 0; i < 100000; i++) {
    currentHash = await crypto.subtle.digest("SHA-256", currentHash);
  }

  return currentHash; // This is the raw key bytes (32 bytes)
}

/**
 * Decrypts the Master Key from the "Locked Box"
 */
export async function unlockMasterKey(password, uid, lockedBox) {
  try {
    const [ivB64, cipherB64] = lockedBox.split(":");
    if (!ivB64 || !cipherB64) throw new Error("Invalid box format");

    // 1. Derive the Key Encryption Key (KEK)
    const kekBytes = await deriveKeyWorker(password, uid);
    const kekKey = await crypto.subtle.importKey(
      "raw",
      kekBytes,
      "AES-CBC",
      false,
      ["decrypt"],
    );

    // 2. Decrypt the Master Key
    const iv = b64ToBuff(ivB64);
    const cipherText = b64ToBuff(cipherB64);

    const decryptedMasterKeyBytes = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      kekKey,
      cipherText,
    );

    return dec.decode(decryptedMasterKeyBytes);
  } catch (e) {
    console.error("Unlock failed", e);
    return null;
  }
}

/**
 * Creates a new Master Key and locks it
 */
export async function generateNewMasterKey(password, uid) {
  // 1. Generate random Master Key (32 bytes)
  const masterKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const masterKeyB64 = buffToB64(masterKeyBytes);

  // 2. Derive KEK
  const kekBytes = await deriveKeyWorker(password, uid);
  const kekKey = await crypto.subtle.importKey(
    "raw",
    kekBytes,
    "AES-CBC",
    false,
    ["encrypt"],
  );

  // 3. Encrypt the Master Key B64 String
  const iv = crypto.getRandomValues(new Uint8Array(16)); // AES-CBC IV is 16 bytes
  const encryptedMasterKey = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    kekKey,
    enc.encode(masterKeyB64),
  );

  return {
    lockedBox: `${buffToB64(iv)}:${buffToB64(encryptedMasterKey)}`,
    masterKeyB64: masterKeyB64,
  };
}

/**
 * ------------------------------------------------------------------
 * MISSING FUNCTION ADDED BELOW
 * ------------------------------------------------------------------
 * Encrypts a specific Diary Entry (AES-GCM)
 */
export async function envelopeEncrypt(data, masterKeyB64) {
  if (!masterKeyB64) throw new Error("Locked");

  // 1. Prepare Master Key
  const masterKeyBytes = b64ToBuff(masterKeyB64);
  const masterKey = await crypto.subtle.importKey(
    "raw",
    masterKeyBytes,
    "AES-GCM",
    false,
    ["encrypt"],
  );

  // 2. Generate Entry Key (32 bytes)
  const entryKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const entryKeyB64 = buffToB64(entryKeyBytes);
  const entryKey = await crypto.subtle.importKey(
    "raw",
    entryKeyBytes,
    "AES-GCM",
    false,
    ["encrypt"],
  );

  // 3. Encrypt Entry Key with Master Key
  const ivEntryKey = crypto.getRandomValues(new Uint8Array(12)); // GCM IV is 12 bytes
  const encryptedEntryKeyBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivEntryKey },
    masterKey,
    enc.encode(entryKeyB64),
  );

  // Helper to encrypt fields
  const encryptField = async (text) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      entryKey,
      enc.encode(text || ""),
    );
    return {
      cipher: buffToB64(cipher),
      iv: buffToB64(iv),
    };
  };

  // 4. Encrypt Fields
  const encTitle = await encryptField(data.title);
  const encContent = await encryptField(data.content);
  const encDate = await encryptField(data.date.toISOString());

  const metadata = JSON.stringify({
    mood: data.mood,
    tags: data.tags || [],
    isFavorite: data.isFavorite,
    fontFamily: data.fontFamily || "plusJakartaSans",
  });
  const encMeta = await encryptField(metadata);

  // 5. Construct Result Object
  return {
    encryptedEntryKey: buffToB64(encryptedEntryKeyBuf),
    ivEntryKey: buffToB64(ivEntryKey),
    cipherTitle: encTitle.cipher,
    ivTitle: encTitle.iv,
    cipherContent: encContent.cipher,
    ivContent: encContent.iv,
    cipherDate: encDate.cipher,
    ivDate: encDate.iv,
    cipherMetadata: encMeta.cipher,
    ivMetadata: encMeta.iv,
  };
}

/**
 * Decrypts a specific Diary Entry.
 */
export async function envelopeDecrypt(data, masterKeyB64) {
  try {
    if (!masterKeyB64) throw new Error("No master key");

    // Import Master Key
    const masterKeyBytes = b64ToBuff(masterKeyB64);
    const masterKey = await crypto.subtle.importKey(
      "raw",
      masterKeyBytes,
      "AES-GCM",
      false,
      ["decrypt"],
    );

    // 1. Decrypt the Entry Key (encrypted with Master Key)
    const entryKeyBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBuff(data.ivEntryKey) },
      masterKey,
      b64ToBuff(data.encryptedEntryKey),
    );

    const entryKey = await crypto.subtle.importKey(
      "raw",
      entryKeyBytes,
      "AES-GCM",
      false,
      ["decrypt"],
    );

    // Helper to decrypt fields
    const decryptField = async (cipherB64, ivB64) => {
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64ToBuff(ivB64) },
        entryKey,
        b64ToBuff(cipherB64),
      );
      return dec.decode(decrypted);
    };

    // 2. Decrypt Fields
    const title = await decryptField(data.cipherTitle, data.ivTitle);
    const content = await decryptField(data.cipherContent, data.ivContent);
    const dateStr = await decryptField(data.cipherDate, data.ivDate);

    let meta = {};
    if (data.cipherMetadata && data.ivMetadata) {
      const metaStr = await decryptField(data.cipherMetadata, data.ivMetadata);
      meta = JSON.parse(metaStr);
    }

    return {
      id: data.id,
      title,
      content,
      date: new Date(dateStr),
      mood: meta.mood,
      tags: meta.tags || [],
      isFavorite: meta.isFavorite || false,
      fontFamily: meta.fontFamily || "plusJakartaSans",
    };
  } catch (e) {
    console.error("Entry decryption failed", e);
    // Return error object like Dart does
    return {
      id: data.id,
      title: "Error",
      content: "Decryption failed",
      date: new Date(),
      isError: true,
    };
  }
}
