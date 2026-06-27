"use client";

import { useParams } from "next/navigation";
import EditUserForm from "./EditUserForm";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;
  
  if (!id) return <p className="text-muted">Loading...</p>;
  
  return <EditUserForm id={id} />;
}
