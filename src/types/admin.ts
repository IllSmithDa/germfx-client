export type AdminDrugIndexSort =
  | "updated_desc"
  | "updated_asc"
  | "created_desc"
  | "created_asc"
  | "name_asc"
  | "name_desc";

export type AdminDrugIndexKind =
  | "brand"
  | "generic"
  | "substance";

export type AdminDrugIndexesParams = {
  q?: string;
  kind?: AdminDrugIndexKind;
  source?: string;
  manufacturer?: string;
  has_upc?: boolean;
  has_ndc?: boolean;
  has_latest_detail?: boolean;
  page?: number;
  page_size?: number;
  sort?: AdminDrugIndexSort;
  sync_openfda ?: boolean;
  openfda_limit ?: number;
};



export type AdminUserStatusFilter = "all" | "active" | "suspended";

export type AdminUsersParams = {
  query?: string;
  status?: AdminUserStatusFilter;
  include_admins?: boolean;
  page?: number;
  page_size?: number;
};

export type AdminDrugDetailSort =
  | "updated_desc"
  | "created_desc"
  | "name_asc";

export type AdminBooleanFilter = boolean | "all" | "yes" | "no";

export type AdminDrugDetailsParams = {
  query?: string;
  has_warnings?: AdminBooleanFilter;
  has_clean_fields?: AdminBooleanFilter;
  source?: string;
  sort?: AdminDrugDetailSort;
  page?: number;
  page_size?: number;
};

export type AdminDrugDetailResyncParams = {
  drug?: string;
  make_latest?: boolean;
  reset_clean_fields?: boolean;
};