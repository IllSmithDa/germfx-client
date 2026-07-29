import { SectionCard, SettingRow, checkboxClass } from "./SettingsUI";

export default function LoggingSettings({
  rememberLastMedication,
  recentSuggestionsFirst,
  savingKey,
  onRememberLastMedicationChange,
  onRecentSuggestionsFirstChange,
}: {
  rememberLastMedication: boolean;
  recentSuggestionsFirst: boolean;
  savingKey: string | null;
  onRememberLastMedicationChange: (value: boolean) => void;
  onRecentSuggestionsFirstChange: (value: boolean) => void;
}) {
  return (
    <SectionCard
      title="Logging Preferences"
      description="Set defaults that can make symptom logging faster."
    >
      <SettingRow
        label="Remember last selected medication"
        description="Preselect the most recently used medication when logging symptoms."
        control={
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberLastMedication}
              disabled={savingKey === "remember_last_medication"}
              onChange={(e) => onRememberLastMedicationChange(e.target.checked)}
              className={checkboxClass}
            />
            <span>Enable</span>
          </label>
        }
      />

      <SettingRow
        label="Show recent symptom suggestions first"
        description="Prioritize recent symptom names to speed up repeated logging."
        control={
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={recentSuggestionsFirst}
              disabled={savingKey === "recent_suggestions_first"}
              onChange={(e) => onRecentSuggestionsFirstChange(e.target.checked)}
              className={checkboxClass}
            />
            <span>Enable</span>
          </label>
        }
      />
    </SectionCard>
  );
}