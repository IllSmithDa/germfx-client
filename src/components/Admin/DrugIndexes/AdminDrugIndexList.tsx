"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  AdminDrugIndexItem,
} from "@/lib/server/fetchAdminDrugIndexes";

import AdminDrugIndexCard from "./AdminDrugIndexCard";
import AdminDrugIndexCodesModal from "./AdminDrugIndexCodesModal";

export default function AdminDrugIndexList({
  items,
}: {
  items: AdminDrugIndexItem[];
}) {
  const [
    localItems,
    setLocalItems,
  ] = useState(items);

  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<AdminDrugIndexItem | null>(
      null
    );

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // console.log("drug index itemss: ", items)

  function handleUpdated(
    updatedItem: AdminDrugIndexItem
  ) {
    setLocalItems((current) =>
      current.map((item) =>
        item.id === updatedItem.id
          ? updatedItem
          : item
      )
    );

    setSelectedItem(updatedItem);
  }

  if (!localItems.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center">
        <h2 className="text-lg font-bold">
          No drug indexes found
        </h2>

        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          Try changing your search, filters, or sort option.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {localItems.map((item) => (
          <AdminDrugIndexCard
            key={item.id}
            item={item}
            onManageCodes={
              setSelectedItem
            }
          />
        ))}
      </div>

      <AdminDrugIndexCodesModal
        open={!!selectedItem}
        item={selectedItem}
        onClose={() =>
          setSelectedItem(null)
        }
        onUpdated={handleUpdated}
      />
    </>
  );
}