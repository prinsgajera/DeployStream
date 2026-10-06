import { decryptToken, encryptToken } from "../../lib/crypto.js";
import type { IEnvVar } from "../../models/repository.model.js";

export function encryptSecretEnvVars(envVars: IEnvVar[]): IEnvVar[] {
  return envVars.map((envVar) =>
    envVar.isSecret ? { ...envVar, value: encryptToken(envVar.value) } : envVar
  );
}

export function decryptSecretEnvVars(envVars: IEnvVar[]): IEnvVar[] {
  return envVars.map((envVar) =>
    envVar.isSecret ? { ...envVar, value: decryptToken(envVar.value) } : envVar
  );
}
