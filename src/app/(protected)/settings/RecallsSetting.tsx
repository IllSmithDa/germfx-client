import { US_STATES } from "@/lib/helpers/statesList";
import type { RecallType } from "@/lib/client/userSettingsApi";
import { SectionCard, SettingRow, selectClass } from "./SettingsUI";

export default function RecallSettings({
  defaultRecallState,
  defaultRecallType,
  savingKey,
  onDefaultRecallStateChange,
  onDefaultRecallTypeChange,
}: {
  defaultRecallState: string;
  defaultRecallType: RecallType;
  savingKey: string | null;
  onDefaultRecallStateChange: (value: string) => void | Promise<void>;
  onDefaultRecallTypeChange: (value: RecallType) => void | Promise<void>;
}) {
  return (
    <SectionCard
      title="Recall Preferences"
      description="Choose defaults for recall browsing."
    >
      <SettingRow
        label="Default recall type"
        description="Used when opening the dedicated recalls page without a type filter."
        control={
          <select
            value={defaultRecallType}
            disabled={savingKey === "default_recall_type"}
            onChange={(e) =>
              onDefaultRecallTypeChange(e.target.value as RecallType)
            }
            className={selectClass}
          >
            <option value="all">All recalls</option>
            <option value="food">Food recalls</option>
            <option value="drug">Medication recalls</option>
          </select>
        }
      />

      <SettingRow
        label="Default recall state"
        description="Used when opening the dedicated recalls page without a state filter."
        control={
          <select
            value={defaultRecallState}
            disabled={savingKey === "default_recall_state"}
            onChange={(e) => onDefaultRecallStateChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">All states</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        }
      />
    </SectionCard>
  );
}