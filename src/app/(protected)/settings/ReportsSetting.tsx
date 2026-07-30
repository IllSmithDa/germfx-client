
import type { ReportRange } from "@/lib/client/userSettingsApi";
import { SectionCard, SettingRow } from "./SettingsUI";
import SortSelect, { SortSelectOption } from "@/components/SortSelector/SortSelect";

const REPORT_RANGE_OPTIONS: readonly SortSelectOption<ReportRange>[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const TOP_SYMPTOM_LIMIT_OPTIONS: readonly SortSelectOption<string>[] = [
  { value: "5", label: "Top 5" },
  { value: "10", label: "Top 10" },
  { value: "15", label: "Top 15" },
];

export default function ReportsSettings({
  defaultReportRange,
  topSymptomLimit,
  savingKey,
  onReportRangeChange,
  onTopSymptomLimitChange,
}: {
  defaultReportRange: ReportRange;
  topSymptomLimit: string;
  savingKey: string | null;
  onReportRangeChange: (value: ReportRange) => void;
  onTopSymptomLimitChange: (value: string) => void;
}) {
  return (
    <SectionCard
      title="Reports Preferences"
      description="Choose default options for your reports page."
    >
      <SettingRow
        label="Default report range"
        description="Used when opening reports before a custom filter is selected."
        control={
          <SortSelect<ReportRange>
            value={defaultReportRange}
            options={REPORT_RANGE_OPTIONS}
            ariaLabel="Select default report range"
            label="Default report range"
            name="default_report_range"
            icon="none"
            variant="field"
            disabled={savingKey === "default_report_range"}
            className="w-full sm:w-56"
            onValueChange={onReportRangeChange}
          />
        }
      />

      <SettingRow
        label="Default top symptom limit"
        description="Controls how many symptom groups are shown by default."
        control={
          <SortSelect<string>
            value={topSymptomLimit}
            options={TOP_SYMPTOM_LIMIT_OPTIONS}
            ariaLabel="Select default top symptom limit"
            label="Default top symptom limit"
            name="top_symptom_limit"
            icon="none"
            variant="field"
            disabled={savingKey === "top_symptom_limit"}
            className="w-full sm:w-56"
            onValueChange={onTopSymptomLimitChange}
          />
        }
      />
    </SectionCard>
  );
}