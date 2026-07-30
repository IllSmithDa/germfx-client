
import type { RecallType } from "@/lib/client/userSettingsApi";
import { US_STATES } from "@/lib/helpers/statesList";
import { SectionCard, SettingRow } from "./SettingsUI";
import SortSelect, { SortSelectOption } from "@/components/SortSelector/SortSelect";

const RECALL_TYPE_OPTIONS: readonly SortSelectOption<RecallType>[] = [
  { value: "all", label: "All recalls" },
  { value: "food", label: "Food recalls" },
  { value: "drug", label: "Medication recalls" },
];

const RECALL_STATE_OPTIONS: readonly SortSelectOption<string>[] = [
  { value: "all", label: "All states" },
  ...US_STATES.map((state) => ({
    value: state.code,
    label: state.name,
  })),
];

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
          <SortSelect<RecallType>
            value={defaultRecallType}
            options={RECALL_TYPE_OPTIONS}
            ariaLabel="Select default recall type"
            label="Default recall type"
            name="default_recall_type"
            icon="none"
            variant="field"
            disabled={savingKey === "default_recall_type"}
            className="w-full sm:w-56"
            onValueChange={(value) => {
              void onDefaultRecallTypeChange(value);
            }}
          />
        }
      />

      <SettingRow
        label="Default recall state"
        description="Used when opening the dedicated recalls page without a state filter."
        control={
          <SortSelect<string>
            value={defaultRecallState}
            options={RECALL_STATE_OPTIONS}
            ariaLabel="Select default recall state"
            label="Default recall state"
            name="default_recall_state"
            icon="none"
            variant="field"
            disabled={savingKey === "default_recall_state"}
            className="w-full sm:w-56"
            onValueChange={(value) => {
              void onDefaultRecallStateChange(value);
            }}
          />
        }
      />
    </SectionCard>
  );
}