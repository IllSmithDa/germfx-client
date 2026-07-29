// src/app/(auth)/register/loading.tsx

import AuthPageSkeleton from "@/components/AppSkeletons/AuthPageSkeleton";

export default function Loading() {
  return <AuthPageSkeleton mode="register" />;
}