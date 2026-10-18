import React, { useState } from "react";
import { X, Plus, Trash2, Loader2, Lock } from "lucide-react";
import type { ImportedRepository, RepositorySettingsPayload } from "../../types/dashboard";

interface RepositorySettingsModalProps {
  repository: ImportedRepository;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: RepositorySettingsPayload) => Promise<void>;
}

interface EnvVarRow {
  id: number;
  key: string;
  value: string;
  isSecret: boolean;
  isExistingSecret: boolean;
}

const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const INPUT_CLASS =
  "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-zinc-600";

export const RepositorySettingsModal: React.FC<RepositorySettingsModalProps> = ({
  repository,
  isSaving,
  error,
  onClose,
  onSave,
}) => {
  const [branch, setBranch] = useState(repository.branch);
  const [framework, setFramework] = useState(repository.framework);
  const [buildCommand, setBuildCommand] = useState(repository.buildCommand);
  const [outputDirectory, setOutputDirectory] = useState(repository.outputDirectory);
  const [nextRowId, setNextRowId] = useState(repository.envVars.length);
  const [rows, setRows] = useState<EnvVarRow[]>(
    repository.envVars.map((envVar, index) => ({
      id: index,
      key: envVar.key,
      value: envVar.value,
      isSecret: envVar.isSecret,
      isExistingSecret: envVar.isSecret,
    }))
  );

  const hasInvalidKey = rows.some((row) => !ENV_KEY_PATTERN.test(row.key));
  const canSave = !isSaving && !hasInvalidKey && [branch, framework, buildCommand, outputDirectory].every(Boolean);

  const updateRow = (id: number, changes: Partial<EnvVarRow>): void =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...changes } : row)));

  const addRow = (): void => {
    setRows((prev) => [...prev, { id: nextRowId, key: "", value: "", isSecret: false, isExistingSecret: false }]);
    setNextRowId((prev) => prev + 1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!canSave) return;
    await onSave({
      branch,
      framework,
      buildCommand,
      outputDirectory,
      envVars: rows.map(({ key, value, isSecret }) => ({ key, value, isSecret })),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Settings for ${repository.repoName}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-2xl max-h-full overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col"
      >
        <header className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="min-w-0">
            <h2 className="font-semibold text-zinc-100 truncate">{repository.repoName} settings</h2>
            <p className="text-xs font-mono text-zinc-500 truncate">{repository.fullName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-200">
              Branch
              <input value={branch} onChange={(e) => setBranch(e.target.value)} className={INPUT_CLASS} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-200">
              Framework
              <input value={framework} onChange={(e) => setFramework(e.target.value)} className={INPUT_CLASS} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-200">
              Build command
              <input value={buildCommand} onChange={(e) => setBuildCommand(e.target.value)} className={INPUT_CLASS} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-200">
              Output directory
              <input
                value={outputDirectory}
                onChange={(e) => setOutputDirectory(e.target.value)}
                className={INPUT_CLASS}
              />
            </label>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-xs font-semibold text-zinc-200 mb-1">Environment variables</legend>
            {rows.length === 0 && <p className="text-xs font-mono text-zinc-500">No variables set.</p>}
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  value={row.key}
                  onChange={(e) => updateRow(row.id, { key: e.target.value })}
                  placeholder="KEY"
                  aria-label="Variable name"
                  className={`${INPUT_CLASS} sm:col-span-4 ${
                    row.key && !ENV_KEY_PATTERN.test(row.key) ? "border-rose-600" : ""
                  }`}
                />
                <input
                  value={row.value}
                  type={row.isSecret ? "password" : "text"}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  placeholder={row.isExistingSecret ? "Unchanged (leave blank to keep)" : "value"}
                  aria-label="Variable value"
                  className={`${INPUT_CLASS} sm:col-span-5`}
                />
                <label className="sm:col-span-2 flex items-center gap-1.5 text-xs font-mono text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.isSecret}
                    onChange={(e) => updateRow(row.id, { isSecret: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <Lock className="w-3 h-3" />
                  Secret
                </label>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                  className="sm:col-span-1 p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all duration-200 cursor-pointer justify-self-start focus-visible:ring-2 focus-visible:ring-cyan-500"
                  aria-label="Remove variable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Plus className="w-3.5 h-3.5" />
              Add variable
            </button>
            <p className="text-xs text-zinc-500">
              Changes apply to the next deployment. Secret values are encrypted and never shown again.
            </p>
          </fieldset>

          {error && (
            <p className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-900/40 rounded-lg p-3">
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save settings
          </button>
        </footer>
      </form>
    </div>
  );
};
