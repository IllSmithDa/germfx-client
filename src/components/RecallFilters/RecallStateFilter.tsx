"use client";

import SortSelect, {
  type SortSelectOption,
} from "@/components/SortSelector/SortSelect";

const STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
  ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
  ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
  ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
  ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
  ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
  ["WI", "Wisconsin"], ["WY", "Wyoming"],
] as const;

type RecallStateFilterValue = "all" | (typeof STATES)[number][0];

const STATE_OPTIONS: readonly SortSelectOption<RecallStateFilterValue>[] = [
  { value: "all", label: "All states" },
  ...STATES.map(([value, label]) => ({ value, label })),
];

export default function RecallStateFilter({
  value = "all",
}: {
  value?: string;
}) {
  return (
    <SortSelect<RecallStateFilterValue>
      value={(value || "all") as RecallStateFilterValue}
      options={STATE_OPTIONS}
      defaultValue="all"
      deleteParamOnDefault={false}
      basePath="/recalls"
      paramName="state"
      ariaLabel="Filter recalls by state"
      label="Filter recalls by state"
      icon="filter"
    />
  );
}