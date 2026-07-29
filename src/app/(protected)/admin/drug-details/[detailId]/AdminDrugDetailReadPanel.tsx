"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  getAdminDrugDetail,
  updateAdminDrugDetailCuratedFields,
  updateAdminDrugDetailSafetyWarnings,
  type AdminDrugDetailEditableFields,
  type AdminDrugDetailReadOut,
  type AdminSafetyWarningItem,
} from "@/lib/client/adminDrugDetailApi";

type CuratedFieldKey = keyof AdminDrugDetailEditableFields;

type CuratedFormState = Record<CuratedFieldKey, string>;

type SafetyWarningFormItem = {
  key: string;
  title: string;
  matchedTerms: string;
  excerpts: string;
};

type FeedbackState = {
  ok: boolean;
  message: string;
} | null;

const curatedFieldConfigs: Array<{
  key: CuratedFieldKey;
  title: string;
  description: string;
  placeholder: string;
}> = [
  {
    key: "purpose_or_indications",
    title: "Usage & Indications",
    description:
      "Consumer-facing usage/indication bullets derived from OpenFDA indications and purpose text.",
    placeholder:
      "One usage or indication per line\nExample: Used with diet and exercise to lower LDL-C in adults.",
  },
  {
    key: "dosage_and_administration",
    title: "Dosage & Administration",
    description:
      "Clean dosage instructions and administration guidance shown on the drug detail page.",
    placeholder:
      "One dosage or administration note per line\nExample: Take once daily with or without food.",
  },
  {
    key: "side_effects",
    title: "Side Effects",
    description:
      "Simplified side effect names or short reaction phrases extracted from label adverse reaction text.",
    placeholder:
      "One side effect per line\nExample: nausea\nExample: dizziness",
  },
];

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function toLabel(value: string) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || "warning";
}

function uniqueKey(baseKey: string, existingKeys: Set<string>) {
  let candidate = baseKey;
  let index = 2;

  while (existingKeys.has(candidate)) {
    candidate = `${baseKey}_${index}`;
    index += 1;
  }

  existingKeys.add(candidate);

  return candidate;
}

function dedupe(items: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const value = String(item || "").trim();

    if (!value) {
      continue;
    }

    const key = value.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    out.push(value);
  }

  return out;
}

function toStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    const text = String(item || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      continue;
    }

    const key = text.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    out.push(text);
  }

  return out;
}

function textareaToList(value: string, options?: { dedupeValues?: boolean }) {
  const out: string[] = [];
  const seen = new Set<string>();
  const shouldDedupe = options?.dedupeValues ?? true;

  for (const line of value.split("\n")) {
    const text = line.replace(/\s+/g, " ").trim();

    if (!text) {
      continue;
    }

    if (shouldDedupe) {
      const key = text.toLowerCase();

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
    }

    out.push(text);
  }

  return out;
}

function listToTextarea(items: string[]) {
  return toStringList(items).join("\n");
}

function fallbackEditableFieldsFromPayload(
  payload: Record<string, unknown>,
): AdminDrugDetailEditableFields {
  return {
    purpose_or_indications: toStringList(payload.purpose_or_indications),
    dosage_and_administration: toStringList(payload.dosage_and_administration),
    side_effects: toStringList(payload.side_effects),
    warnings_simple: toStringList(payload.warnings_simple),
  };
}

function getEditableFields(
  data: AdminDrugDetailReadOut,
): AdminDrugDetailEditableFields {
  return (
    data.editable_fields ?? fallbackEditableFieldsFromPayload(data.payload)
  );
}

function editableFieldsToFormState(
  fields: AdminDrugDetailEditableFields,
): CuratedFormState {
  return {
    purpose_or_indications: listToTextarea(fields.purpose_or_indications),
    dosage_and_administration: listToTextarea(fields.dosage_and_administration),
    side_effects: listToTextarea(fields.side_effects),
    warnings_simple: listToTextarea(fields.warnings_simple),
  };
}

function formStateToEditableFields(
  state: CuratedFormState,
): AdminDrugDetailEditableFields {
  return {
    purpose_or_indications: textareaToList(state.purpose_or_indications),
    dosage_and_administration: textareaToList(state.dosage_and_administration),
    side_effects: textareaToList(state.side_effects),
    warnings_simple: textareaToList(state.warnings_simple),
  };
}

function emptyFormState(): CuratedFormState {
  return {
    purpose_or_indications: "",
    dosage_and_administration: "",
    side_effects: "",
    warnings_simple: "",
  };
}

function safetyWarningsToFormItems(
  items: AdminSafetyWarningItem[],
): SafetyWarningFormItem[] {
  const usedKeys = new Set<string>();

  return (items || [])
    .filter((item) => item?.title || item?.excerpts?.length)
    .map((item, index) => {
      const baseKey = item.key?.trim() || slugify(item.title || `warning_${index + 1}`);

      return {
        key: uniqueKey(baseKey, usedKeys),
        title: String(item.title || "").trim(),
        matchedTerms: (item.matched_terms || []).join("\n"),
        excerpts: (item.excerpts || []).join("\n"),
      };
    });
}

function formItemsToSafetyWarnings(
  items: SafetyWarningFormItem[],
): AdminSafetyWarningItem[] {
  const usedKeys = new Set<string>();

  return items
    .map((item, index) => {
      const title = item.title.trim();
      const excerpts = textareaToList(item.excerpts, {
        dedupeValues: false,
      });
      const matchedTerms = textareaToList(item.matchedTerms);

      if (!title && excerpts.length === 0) {
        return null;
      }

      const baseKey = item.key?.trim() || slugify(title || `warning_${index + 1}`);

      return {
        key: uniqueKey(baseKey, usedKeys),
        title: title || toLabel(baseKey.replace(/_/g, " ")),
        matched_terms: matchedTerms,
        excerpts,
      };
    })
    .filter((item): item is AdminSafetyWarningItem => Boolean(item));
}

function MetadataRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold">{value ?? "—"}</div>
    </div>
  );
}

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) {
    return null;
  }

  return (
    <div
      className={[
        "rounded-xl border px-4 py-3 text-sm",
        state.ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
      ].join(" ")}
    >
      {state.message}
    </div>
  );
}

function CuratedTextArea({
  title,
  description,
  placeholder,
  value,
  onChange,
}: {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const itemCount = useMemo(() => textareaToList(value).length, [value]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="flex items-start justify-between gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          {itemCount}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={8}
        className="min-h-44 w-full resize-y bg-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-[hsl(var(--muted-foreground))]/70 focus:ring-2 focus:ring-inset focus:ring-[hsl(var(--ring))]"
      />
    </section>
  );
}

function WarningPill({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-full border px-3 py-1 text-sm font-semibold capitalize transition-all hover:-translate-y-[1px]",
        "border-amber-900 bg-amber-200 text-amber-950 shadow-sm hover:bg-amber-300 dark:bg-amber-700 dark:text-amber-50 dark:border-amber-300 dark:hover:bg-amber-600",
        isSelected
          ? "ring-2 ring-amber-900/30 bg-amber-300 dark:bg-amber-500"
          : "",
      ].join(" ")}
    >
      {toLabel(label)}
    </button>
  );
}

function WarningCard({
  item,
}: {
  item: AdminSafetyWarningItem | null;
}) {
  if (!item) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-4 space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{item.title}</h4>
        {item.matched_terms.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.matched_terms.map((term) => (
              <span
                key={term}
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs text-[hsl(var(--muted-foreground))]"
              >
                {toLabel(term)}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {item.excerpts.length > 0 ? (
        <div className="space-y-2">
          {item.excerpts.map((excerpt, index) => (
            <p
              key={`${item.key}-${index}`}
              className="text-sm leading-6 text-[hsl(var(--muted-foreground))]"
            >
              {excerpt}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No warning excerpt available.
        </p>
      )}
    </div>
  );
}

function StructuredSafetyWarningsPreview({
  items,
  rawText,
  warningsRawCount,
  source,
}: {
  items: AdminSafetyWarningItem[];
  rawText: string;
  warningsRawCount?: number;
  source?: string;
}) {
  const normalized = useMemo(
    () =>
      (items || [])
        .filter((item) => item?.key && item?.title)
        .map((item) => ({
          ...item,
          matched_terms: dedupe(item.matched_terms || []),
          excerpts: dedupe(item.excerpts || []),
        })),
    [items],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedKey((current) => {
      if (current && normalized.some((item) => item.key === current)) {
        return current;
      }

      return normalized[0]?.key ?? null;
    });
  }, [normalized]);

  const selectedItem =
    normalized.find((item) => item.key === selectedKey) ?? normalized[0] ?? null;

  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">Safety warning preview</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            This preview mirrors the public safety warning panel. When edited,
            these values are saved as structured curated safety warnings rather
            than being rebuilt from raw warning text on every page load.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1">
            {normalized.length} categories
          </span>
          <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1">
            {warningsRawCount ?? 0} raw warning fields
          </span>
          {source ? (
            <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1">
              {source}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {normalized.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {normalized.map((item) => (
                <WarningPill
                  key={item.key}
                  label={item.title}
                  isSelected={selectedItem?.key === item.key}
                  onClick={() => setSelectedKey(item.key)}
                />
              ))}
            </div>

            <WarningCard item={selectedItem} />
          </>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No structured warning highlights available. Add one below or check
            whether this drug detail has warnings_raw saved in the database.
          </p>
        )}
      </div>

      {rawText ? (
        <details className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
          <summary className="cursor-pointer text-sm font-bold">
            Raw warning extraction text
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            {rawText}
          </pre>
        </details>
      ) : null}
    </section>
  );
}

function SafetyWarningsEditor({
  items,
  dirty,
  saving,
  onAdd,
  onChange,
  onRemove,
  onReset,
  onSave,
}: {
  items: SafetyWarningFormItem[];
  dirty: boolean;
  saving: boolean;
  onAdd: () => void;
  onChange: (
    index: number,
    field: keyof SafetyWarningFormItem,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold">Editable structured safety warnings</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            Edit the warning cards shown in the public safety-warning panel.
            Excerpts are preserved as written aside from trimming blank lines,
            so grammar and capitalization fixes can be saved.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={saving}
            className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add warning
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={!dirty || saving}
            className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset warnings
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save warnings"}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item.key}-${index}`}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <label className="grid flex-1 gap-1.5">
                  <span className="text-sm font-bold">Warning title</span>
                  <input
                    value={item.title}
                    onChange={(event) =>
                      onChange(index, "title", event.target.value)
                    }
                    placeholder="Example: Allergic Reaction"
                    className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  disabled={saving}
                  className="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold">Matched terms</span>
                  <textarea
                    value={item.matchedTerms}
                    onChange={(event) =>
                      onChange(index, "matchedTerms", event.target.value)
                    }
                    rows={5}
                    placeholder="One matched term per line"
                    className="min-h-32 resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm font-bold">Warning excerpts</span>
                  <textarea
                    value={item.excerpts}
                    onChange={(event) =>
                      onChange(index, "excerpts", event.target.value)
                    }
                    rows={5}
                    placeholder="One excerpt per line. These are shown in the warning card."
                    className="min-h-32 resize-y rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </label>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
            No structured warnings are currently available. Add one manually or
            regenerate from raw warning text on the backend.
          </div>
        )}
      </div>
    </section>
  );
}

export default function AdminDrugDetailReadPanel({
  detailId,
}: {
  detailId: number;
}) {
  const [data, setData] = useState<AdminDrugDetailReadOut | null>(null);
  const [formState, setFormState] = useState<CuratedFormState>(emptyFormState);
  const [safetyWarningItems, setSafetyWarningItems] = useState<
    SafetyWarningFormItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [savingCuratedFields, setSavingCuratedFields] = useState(false);
  const [savingSafetyWarnings, setSavingSafetyWarnings] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [safetyWarningsDirty, setSafetyWarningsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setLoading(true);
      setError(null);
      setFeedback(null);

      try {
        const result = await getAdminDrugDetail(detailId);

        if (!cancelled) {
          setData(result);
          setFormState(editableFieldsToFormState(getEditableFields(result)));
          setSafetyWarningItems(
            safetyWarningsToFormItems(result.safety_warnings?.warnings_flat ?? []),
          );
          setDirty(false);
          setSafetyWarningsDirty(false);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load admin drug detail.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [detailId]);

  const safetyWarningsPreviewItems = useMemo(
    () => formItemsToSafetyWarnings(safetyWarningItems),
    [safetyWarningItems],
  );

  function updateFormField(key: CuratedFieldKey, value: string) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
    setDirty(true);
    setFeedback(null);
  }

  function updateSafetyWarningField(
    index: number,
    field: keyof SafetyWarningFormItem,
    value: string,
  ) {
    setSafetyWarningItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
    setSafetyWarningsDirty(true);
    setFeedback(null);
  }

  function addSafetyWarning() {
    setSafetyWarningItems((current) => [
      ...current,
      {
        key: `manual_warning_${Date.now()}`,
        title: "",
        matchedTerms: "",
        excerpts: "",
      },
    ]);
    setSafetyWarningsDirty(true);
    setFeedback(null);
  }

  function removeSafetyWarning(index: number) {
    setSafetyWarningItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setSafetyWarningsDirty(true);
    setFeedback(null);
  }

  function resetForm() {
    if (!data) {
      return;
    }

    setFormState(editableFieldsToFormState(getEditableFields(data)));
    setDirty(false);
    setFeedback(null);
  }

  function resetSafetyWarnings() {
    if (!data) {
      return;
    }

    setSafetyWarningItems(
      safetyWarningsToFormItems(data.safety_warnings?.warnings_flat ?? []),
    );
    setSafetyWarningsDirty(false);
    setFeedback(null);
  }

  async function saveCuratedFields() {
    setSavingCuratedFields(true);
    setFeedback(null);

    try {
      const result = await updateAdminDrugDetailCuratedFields({
        detailId,
        fields: formStateToEditableFields(formState),
      });

      setData(result);
      setFormState(editableFieldsToFormState(getEditableFields(result)));
      setSafetyWarningItems(
        safetyWarningsToFormItems(result.safety_warnings?.warnings_flat ?? []),
      );
      setDirty(false);
      setSafetyWarningsDirty(false);
      setFeedback({
        ok: true,
        message: "Curated drug detail fields saved successfully.",
      });
    } catch (caughtError) {
      setFeedback({
        ok: false,
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to save curated fields.",
      });
    } finally {
      setSavingCuratedFields(false);
    }
  }

  async function saveSafetyWarnings() {
    setSavingSafetyWarnings(true);
    setFeedback(null);

    try {
      const result = await updateAdminDrugDetailSafetyWarnings({
        detailId,
        warningsFlat: safetyWarningsPreviewItems,
      });

      setData(result);
      setFormState(editableFieldsToFormState(getEditableFields(result)));
      setSafetyWarningItems(
        safetyWarningsToFormItems(result.safety_warnings?.warnings_flat ?? []),
      );
      setDirty(false);
      setSafetyWarningsDirty(false);
      setFeedback({
        ok: true,
        message: "Structured safety warnings saved successfully.",
      });
    } catch (caughtError) {
      setFeedback({
        ok: false,
        message:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to save structured safety warnings.",
      });
    } finally {
      setSavingSafetyWarnings(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
        Loading admin drug detail…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { detail, payload } = data;
  const safetyWarnings = data.safety_warnings;

  return (
    <div className="space-y-5">
      <Feedback state={feedback} />

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {detail.name || `Drug detail #${detail.id}`}
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Detail #{detail.id}
              {detail.drug_index_id
                ? ` • DrugIndex #${detail.drug_index_id}`
                : ""}
            </p>
          </div>

          <span
            className={[
              "w-fit rounded-full px-3 py-1 text-xs font-semibold",
              detail.latest_for_index
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
            ].join(" ")}
          >
            {detail.latest_for_index ? "Latest for index" : "Older detail"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetadataRow label="Source" value={detail.source} />
          <MetadataRow label="Query used" value={detail.query_used} />
          <MetadataRow label="Effective time" value={detail.effective_time} />
          <MetadataRow label="Updated" value={formatDate(detail.updated_at)} />
          <MetadataRow
            label="Indications"
            value={textareaToList(formState.purpose_or_indications).length}
          />
          <MetadataRow
            label="Dosage"
            value={textareaToList(formState.dosage_and_administration).length}
          />
          <MetadataRow
            label="Side effects"
            value={textareaToList(formState.side_effects).length}
          />
          <MetadataRow
            label="Simple warnings"
            value={textareaToList(formState.warnings_simple).length}
          />
          <MetadataRow
            label="Structured warnings"
            value={safetyWarningsPreviewItems.length}
          />
          <MetadataRow
            label="Warnings raw fields"
            value={safetyWarnings?.matched_from_fields?.warnings_raw_count ?? 0}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-bold">Curated detail fields</h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              These are application-built fields that are most likely to need
              review after raw OpenFDA resyncs or future cleaner/AI processing.
              Enter one item per line.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={!dirty || savingCuratedFields}
              className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={saveCuratedFields}
              disabled={savingCuratedFields || !dirty}
              className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingCuratedFields ? "Saving…" : "Save curated fields"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {curatedFieldConfigs.map((field) => (
            <CuratedTextArea
              key={field.key}
              title={field.title}
              description={field.description}
              placeholder={field.placeholder}
              value={formState[field.key]}
              onChange={(value) => updateFormField(field.key, value)}
            />
          ))}
        </div>
      </div>
      <SafetyWarningsEditor
        items={safetyWarningItems}
        dirty={safetyWarningsDirty}
        saving={savingSafetyWarnings}
        onAdd={addSafetyWarning}
        onChange={updateSafetyWarningField}
        onRemove={removeSafetyWarning}
        onReset={resetSafetyWarnings}
        onSave={saveSafetyWarnings}
      />
      <StructuredSafetyWarningsPreview
        items={safetyWarningsPreviewItems}
        rawText={safetyWarnings?.raw_text ?? ""}
        warningsRawCount={safetyWarnings?.matched_from_fields?.warnings_raw_count}
        source={safetyWarnings?.source}
      />


      <details className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <summary className="cursor-pointer text-lg font-bold">
          Raw admin payload preview
        </summary>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Use this to compare the raw/stored payload against the curated fields
          above after a resync.
        </p>

        <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-[hsl(var(--muted))]/70 p-4 text-xs leading-5">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </details>
    </div>
  );
}