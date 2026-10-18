import { decryptToken, encryptToken } from "../../lib/crypto.js";
import type { IEnvVar } from "../../models/repository.model.js";

function withValue(envVar: IEnvVar, value: string): IEnvVar {
  return { key: envVar.key, value, isSecret: envVar.isSecret };
}

export function encryptSecretEnvVars(envVars: IEnvVar[]): IEnvVar[] {
  return envVars.map((envVar) =>
    withValue(envVar, envVar.isSecret ? encryptToken(envVar.value) : envVar.value)
  );
}

export function decryptSecretEnvVars(envVars: IEnvVar[]): IEnvVar[] {
  return envVars.map((envVar) =>
    withValue(envVar, envVar.isSecret ? decryptToken(envVar.value) : envVar.value)
  );
}

export function maskSecretEnvVars(envVars: IEnvVar[]): IEnvVar[] {
  return envVars.map((envVar) => withValue(envVar, envVar.isSecret ? "" : envVar.value));
}

export function mergeEnvVars(existing: IEnvVar[], incoming: IEnvVar[]): IEnvVar[] {
  const existingByKey = new Map(existing.map((envVar) => [envVar.key, envVar]));

  return incoming.flatMap((envVar) => {
    if (envVar.isSecret && envVar.value === "") {
      const previous = existingByKey.get(envVar.key);
      return previous?.isSecret ? [withValue(previous, previous.value)] : [];
    }
    return encryptSecretEnvVars([envVar]);
  });
}
