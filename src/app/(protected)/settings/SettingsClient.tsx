"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  RecallType,
  resetUserSettings,
  updateUserSettings,
  type ReportRange,
  type ThemeValue,
  type TopSymptomLimit,
  type UserSettings,
} from "@/lib/client/userSettingsApi";
import ReportsSettings from "./ReportsSetting";
import RecallsSettings from "./RecallsSetting";
import LoggingSettings from "./LoggingSettings";
import AppearanceSettings from "./AppearanceSettings";
import DataShortcuts from "./DataShortCuts";
import PrivacyInteraction from "./PrivacyInteraction";


export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: UserSettings;
}) {
  const { setTheme: setNextTheme } = useTheme();
  const [theme, setThemeState] = useState<ThemeValue>(initialSettings.theme);

  const [defaultReportRange, setDefaultReportRange] = useState<ReportRange>(
    initialSettings.default_report_range
  );
  const [topSymptomLimit, setTopSymptomLimit] = useState(
    String(initialSettings.top_symptom_limit)
  );
  const [rememberLastMedication, setRememberLastMedication] = useState(
    initialSettings.remember_last_medication
  );
  const [recentSuggestionsFirst, setRecentSuggestionsFirst] = useState(
    initialSettings.recent_suggestions_first
  );
  const [defaultRecallState, setDefaultRecallState] = useState(
    initialSettings.default_recall_state
  );
  const [defaultRecallType, setDefaultRecallType] = useState<RecallType>(
    initialSettings.default_recall_type ?? "all"
  );
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function saveSettingsUpdate(payload: Parameters<typeof updateUserSettings>[0]) {
    const result = await updateUserSettings(payload);

    if (!result.ok || !result.data) {
      throw new Error(result.error ?? "Unable to save settings.");
    }

    return result.data;
  }

  function showSavedMessage(message = "Settings saved.") {
    setSavedMessage(message);
    setErrorMessage("");
    window.setTimeout(() => setSavedMessage(""), 1800);
  }

  function showErrorMessage(message = "Unable to save settings.") {
    setErrorMessage(message);
    setSavedMessage("");
    window.setTimeout(() => setErrorMessage(""), 2500);
  }

  async function updateThemeSetting(value: ThemeValue) {
    const previous = theme;

    try {
      setSavingKey("theme");
      setThemeState(value);
      setNextTheme(value);

      await saveSettingsUpdate({ theme: value });
      showSavedMessage();
    } catch (error) {
      setThemeState(previous);
      setNextTheme(previous);
      showErrorMessage(
        error instanceof Error ? error.message : "Unable to save settings."
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function updateReportRange(value: ReportRange) {
    const previous = defaultReportRange;

    try {
      setSavingKey("default_report_range");
      setDefaultReportRange(value);
      await saveSettingsUpdate({ default_report_range: value });
      showSavedMessage();
    } catch {
      setDefaultReportRange(previous);
      showErrorMessage();
    } finally {
      setSavingKey(null);
    }
  }
  async function updateDefaultRecallType(value: RecallType) {
    const previous = defaultRecallType;

    try {
      setSavingKey("default_recall_type");
      setDefaultRecallType(value);

      await saveSettingsUpdate({ default_recall_type: value });

      showSavedMessage();
    } catch (error) {
      setDefaultRecallType(previous);
      showErrorMessage(
        error instanceof Error ? error.message : "Unable to save settings."
      );
    } finally {
      setSavingKey(null);
    }
  }
  async function updateTopSymptomLimit(value: string) {
    const previous = topSymptomLimit;

    try {
      setSavingKey("top_symptom_limit");
      setTopSymptomLimit(value);
      await saveSettingsUpdate({
        top_symptom_limit: Number(value) as TopSymptomLimit,
      });
      showSavedMessage();
    } catch {
      setTopSymptomLimit(previous);
      showErrorMessage();
    } finally {
      setSavingKey(null);
    }
  }

  async function updateRememberLastMedication(value: boolean) {
    const previous = rememberLastMedication;

    try {
      setSavingKey("remember_last_medication");
      setRememberLastMedication(value);
      await saveSettingsUpdate({ remember_last_medication: value });
      showSavedMessage();
    } catch {
      setRememberLastMedication(previous);
      showErrorMessage();
    } finally {
      setSavingKey(null);
    }
  }

  async function updateRecentSuggestionsFirst(value: boolean) {
    const previous = recentSuggestionsFirst;

    try {
      setSavingKey("recent_suggestions_first");
      setRecentSuggestionsFirst(value);
      await saveSettingsUpdate({ recent_suggestions_first: value });
      showSavedMessage();
    } catch {
      setRecentSuggestionsFirst(previous);
      showErrorMessage();
    } finally {
      setSavingKey(null);
    }
  }

  async function updateDefaultRecallState(value: string) {
    const previous = defaultRecallState;

    try {
      setSavingKey("default_recall_state");
      setDefaultRecallState(value);
      await saveSettingsUpdate({ default_recall_state: value });
      showSavedMessage();
    } catch {
      setDefaultRecallState(previous);
      showErrorMessage();
    } finally {
      setSavingKey(null);
    }
  }

  async function resetSettings() {
    try {
      setSavingKey("reset");
    
      const result = await resetUserSettings();
    
      if (!result.ok || !result.data) {
        showErrorMessage(result.error ?? "Unable to reset settings.");
        return;
      }
    
      const settings = result.data;
    
      setThemeState(settings.theme);
      setNextTheme(settings.theme);
      setDefaultReportRange(settings.default_report_range);
      setTopSymptomLimit(String(settings.top_symptom_limit));
      setRememberLastMedication(settings.remember_last_medication);
      setRecentSuggestionsFirst(settings.recent_suggestions_first);
      setDefaultRecallState(settings.default_recall_state);
      setDefaultRecallType(settings.default_recall_type ?? "all");
      showSavedMessage("Settings reset.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-149px)] mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Manage how SideFX works for you across devices.
          </p>
        </div>

        {savedMessage ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {savedMessage}
          </span>
        ) : null}

        {errorMessage ? (
          <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {errorMessage}
          </span>
        ) : null}
      </div>

      <div className="mt-6 space-y-6">
        <ReportsSettings
          defaultReportRange={defaultReportRange}
          topSymptomLimit={topSymptomLimit}
          savingKey={savingKey}
          onReportRangeChange={updateReportRange}
          onTopSymptomLimitChange={updateTopSymptomLimit}
        />

        <RecallsSettings
          defaultRecallState={defaultRecallState}
          savingKey={savingKey}
          onDefaultRecallStateChange={updateDefaultRecallState}
          defaultRecallType={defaultRecallType}
          onDefaultRecallTypeChange={updateDefaultRecallType}
        />

        <LoggingSettings
          rememberLastMedication={rememberLastMedication}
          recentSuggestionsFirst={recentSuggestionsFirst}
          savingKey={savingKey}
          onRememberLastMedicationChange={updateRememberLastMedication}
          onRecentSuggestionsFirstChange={updateRecentSuggestionsFirst}
        />

        <AppearanceSettings
          theme={theme}
          savingKey={savingKey}
          onThemeChange={updateThemeSetting}
        />

        <DataShortcuts />

        <PrivacyInteraction />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetSettings}
            disabled={savingKey === "reset"}
            className="rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-500/20 disabled:opacity-60 dark:text-rose-400"
          >
            {savingKey === "reset" ? "Resetting..." : "Reset settings"}
          </button>
        </div>
      </div>
    </div>
  );
}