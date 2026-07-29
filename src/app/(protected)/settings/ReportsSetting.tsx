import type { ReportRange } from "@/lib/client/userSettingsApi";
import { SectionCard, SettingRow, selectClass } from "./SettingsUI";

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
          <select
            value={defaultReportRange}
            disabled={savingKey === "default_report_range"}
            onChange={(e) => onReportRangeChange(e.target.value as ReportRange)}
            className={selectClass}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        }
      />

      <SettingRow
        label="Default top symptom limit"
        description="Controls how many symptom groups are shown by default."
        control={
          <select
            value={topSymptomLimit}
            disabled={savingKey === "top_symptom_limit"}
            onChange={(e) => onTopSymptomLimitChange(e.target.value)}
            className={selectClass}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
          </select>
        }
      />
    </SectionCard>
  );
}