import { describe, expect, it } from "vitest";
import {
  DEV_SMTP_CREDENTIAL_DIRECTORY,
  DEV_SMTP_CREDENTIAL_PATH,
  readDevHostingerSmtpPassword,
} from "../server/dev-hostinger-smtp-credential.mjs";

const dev = {
  APP_ENV: "development",
  NODE_ENV: "development",
  REPLIT_DEPLOYMENT: "",
};

function fakeFs({
  password = "Hostinger-AppPass-012345",
  directoryUid = 21110,
  directoryGid = 21110,
  directoryMode = 0o40700,
  directorySymlink = false,
  tmpfsType = 0x01021994,
  fileUid = 21110,
  fileGid = 21110,
  fileMode = 0o100400,
  fileSymlink = false,
  fileType = "file",
} = {}) {
  return {
    lstatSync(path: string) {
      if (path === DEV_SMTP_CREDENTIAL_DIRECTORY) {
        return {
          uid: directoryUid, gid: directoryGid, mode: directoryMode,
          isDirectory: () => true, isSymbolicLink: () => directorySymlink,
        };
      }
      if (path === DEV_SMTP_CREDENTIAL_PATH) {
        if (fileType === "missing") throw Object.assign(new Error("missing"), { code: "ENOENT" });
        return {
          uid: fileUid, gid: fileGid, mode: fileMode, size: password.length,
          isFile: () => true, isSymbolicLink: () => fileSymlink,
        };
      }
      throw new Error("unexpected path");
    },
    realpathSync(path: string) { return path; },
    statfsSync() { return { type: tmpfsType }; },
    readFileSync() { return password; },
  };
}

describe("Hostinger SMTP App Password private DEV tmpfs credential", () => {
  it("reads the password only from the exact private tmpfs path", () => {
    expect(readDevHostingerSmtpPassword({ env: dev, fs: fakeFs() }))
      .toBe("Hostinger-AppPass-012345");
  });

  it("never reads the credential in production or Replit", () => {
    expect(readDevHostingerSmtpPassword({
      env: { ...dev, APP_ENV: "production" }, fs: fakeFs(),
    })).toBe("");
    expect(readDevHostingerSmtpPassword({
      env: { ...dev, NODE_ENV: "production" }, fs: fakeFs(),
    })).toBe("");
    expect(readDevHostingerSmtpPassword({
      env: { ...dev, REPLIT_DEPLOYMENT: "1" }, fs: fakeFs(),
    })).toBe("");
  });

  it.each([
    ["wrong directory owner", { directoryUid: 0 }],
    ["wrong directory group", { directoryGid: 0 }],
    ["wrong directory mode", { directoryMode: 0o40755 }],
    ["directory symlink", { directorySymlink: true }],
    ["non-tmpfs directory", { tmpfsType: 0xEF53 }],
    ["wrong file owner", { fileUid: 0 }],
    ["wrong file group", { fileGid: 0 }],
    ["wrong file mode", { fileMode: 0o100444 }],
    ["file symlink", { fileSymlink: true }],
    ["missing file", { fileType: "missing" }],
    ["short password", { password: "short" }],
    ["control characters", { password: "password\nwith-newline" }],
  ])("fails closed for %s", (_label, options) => {
    expect(readDevHostingerSmtpPassword({ env: dev, fs: fakeFs(options) })).toBe("");
  });
});
