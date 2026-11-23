import {
  lstatSync,
  realpathSync,
  readFileSync,
  statfsSync,
} from "node:fs";

export const DEV_SMTP_CREDENTIAL_DIRECTORY =
  "/run/credentials/cst-customer-portal-dev.service";
export const DEV_SMTP_CREDENTIAL_PATH =
  DEV_SMTP_CREDENTIAL_DIRECTORY + "/hostinger-smtp-pass";
const APP_UID = 21110;
const APP_GID = 21110;
const TMPFS_MAGIC = 0x01021994;

function regularPrivateEntry(info, mode, sizeMin = 0, sizeMax = Number.MAX_SAFE_INTEGER) {
  return Boolean(info &&
    info.isFile?.() === true &&
    info.isSymbolicLink?.() !== true &&
    info.uid === APP_UID &&
    info.gid === APP_GID &&
    (info.mode & 0o777) === mode &&
    info.size >= sizeMin &&
    info.size <= sizeMax);
}

/**
 * Reads the Hostinger SMTP App Password only from the private DEV tmpfs.
 * Never falls back to a host path, env override, database, or production.
 */
export function readDevHostingerSmtpPassword({
  env = process.env,
  fs = { lstatSync, realpathSync, readFileSync, statfsSync },
} = {}) {
  if (env.APP_ENV !== "development" ||
      env.NODE_ENV === "production" ||
      env.REPLIT_DEPLOYMENT === "1") return "";

  try {
    const directory = DEV_SMTP_CREDENTIAL_DIRECTORY;
    const file = DEV_SMTP_CREDENTIAL_PATH;
    const dirInfo = fs.lstatSync(directory);
    if (!dirInfo.isDirectory?.() || dirInfo.isSymbolicLink?.() === true ||
        dirInfo.uid !== APP_UID || dirInfo.gid !== APP_GID ||
        (dirInfo.mode & 0o777) !== 0o700 ||
        fs.realpathSync(directory) !== directory ||
        Number(fs.statfsSync(directory).type) !== TMPFS_MAGIC) return "";

    const info = fs.lstatSync(file);
    if (!regularPrivateEntry(info, 0o400, 8, 512) ||
        fs.realpathSync(file) !== file) return "";

    const value = fs.readFileSync(file, "utf8");
    if (typeof value !== "string" ||
        !/^[\x21-\x7e]{8,512}$/.test(value)) return "";
    return value;
  } catch {
    return "";
  }
}
