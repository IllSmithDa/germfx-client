"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  AdminDrugIndexItem,
} from "@/lib/server/fetchAdminDrugIndexes";

import {
  updateDrugIndexCodesRequest,
} from "@/lib/client/adminDrugIndexCodesApi";

type CodeType = "upc" | "ndc";

function parseCodeInput(value: string) {
  return value
    .split(/[\n,]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function CodeList({
  title,
  type,
  codes,
  onRemove,
  loadingCode,
}: {
  title: string;
  type: CodeType;
  codes: string[];
  onRemove: (
    type: CodeType,
    code: string
  ) => void;
  loadingCode: string | null;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black">
          {title}
        </h3>

        <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-bold text-[hsl(var(--muted-foreground))]">
          {codes.length}
        </span>
      </div>

      {codes.length > 0 ? (
        <div className="space-y-2">
          {codes.map((code) => {
            const isLoading =
              loadingCode ===
              `${type}:${code}`;

            return (
              <div
                key={`${type}:${code}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              >
                <code className="break-all text-xs font-bold text-[hsl(var(--foreground))]">
                  {code}
                </code>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    onRemove(type, code)
                  }
                  className="shrink-0 rounded-lg border border-red-400/30 px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-300"
                >
                  {isLoading
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-3 text-sm text-[hsl(var(--muted-foreground))]">
          No {title.toLowerCase()} saved.
        </p>
      )}
    </section>
  );
}

export default function AdminDrugIndexCodesModal({
  item,
  open,
  onClose,
  onUpdated,
}: {
  item: AdminDrugIndexItem | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (
    item: AdminDrugIndexItem
  ) => void;
}) {
  const [
    upcInput,
    setUpcInput,
  ] = useState("");

  const [
    ndcInput,
    setNdcInput,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    loadingCode,
    setLoadingCode,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      setUpcInput("");
      setNdcInput("");
      setError(null);
      setSuccess(null);
      setIsSaving(false);
      setLoadingCode(null);
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        open
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [open, onClose]);

  const parsedUpcCodes =
    useMemo(
      () => parseCodeInput(upcInput),
      [upcInput]
    );

  const parsedNdcCodes =
    useMemo(
      () => parseCodeInput(ndcInput),
      [ndcInput]
    );

  if (!open || !item) {
    return null;
  }

  async function handleAddCodes() {
    if (!item) {
      return;
    }

    if (
      !parsedUpcCodes.length &&
      !parsedNdcCodes.length
    ) {
      setError(
        "Enter at least one UPC or NDC code."
      );
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result =
      await updateDrugIndexCodesRequest(
        item.id,
        {
          add_upc_codes:
            parsedUpcCodes,
          add_ndc_codes:
            parsedNdcCodes,
        }
      );

    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onUpdated(result.data);
    setUpcInput("");
    setNdcInput("");
    setSuccess("Codes added.");
  }

  async function handleRemove(
    type: CodeType,
    code: string
  ) {
    if (!item) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${type.toUpperCase()} code "${code}" from ${item.name}? This can affect barcode matching.`
      );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoadingCode(
      `${type}:${code}`
    );

    const result =
      await updateDrugIndexCodesRequest(
        item.id,
        type === "upc"
          ? {
              remove_upc_codes: [
                code,
              ],
            }
          : {
              remove_ndc_codes: [
                code,
              ],
            }
      );

    setLoadingCode(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onUpdated(result.data);
    setSuccess("Code removed.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 sm:px-4 py-3 sm:py-6">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="border-b border-[hsl(var(--border))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Manage codes
              </p>

              <h2 className="mt-1 break-words text-xl font-black">
                {item.name}
              </h2>

              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                ID {item.id}
                {item.manufacturer
                  ? ` • ${item.manufacturer}`
                  : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[hsl(var(--border))] px-2 sm:px-3 py-2 text-sm font-bold transition hover:bg-[hsl(var(--muted))]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <CodeList
              title="UPC codes"
              type="upc"
              codes={
                item.upc_codes ?? []
              }
              onRemove={handleRemove}
              loadingCode={
                loadingCode
              }
            />

            <CodeList
              title="NDC codes"
              type="ndc"
              codes={
                item.ndc_codes ?? []
              }
              onRemove={handleRemove}
              loadingCode={
                loadingCode
              }
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
            <h3 className="text-sm font-black">
              Add codes
            </h3>

            <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
              You can paste multiple codes separated by commas or new lines.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                  UPC codes
                </span>

                <textarea
                  value={upcInput}
                  onChange={(event) =>
                    setUpcInput(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Example: 041167002254"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-3 py-2 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                  NDC codes
                </span>

                <textarea
                  value={ndcInput}
                  onChange={(event) =>
                    setNdcInput(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Example: 41167-0022-5"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 sm:px-3 py-2 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </label>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-2 sm:px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2 sm:px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                {success}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleAddCodes}
                className="rounded-xl bg-[hsl(var(--primary))] px-2 sm:px-4 py-2 text-sm font-black text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Add codes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}