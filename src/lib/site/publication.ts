export type DirectOwnerApproval = {
  publication: "public-approved";
  approvedAt: string;
  approvedBy: "Deven Langston";
  approvalAuthority: "RVA3D owner";
  approvalSource: "direct-owner-approval";
};

export function hasDirectOwnerApproval(value: unknown): value is DirectOwnerApproval {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.publication === "public-approved" &&
    typeof record.approvedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.approvedAt) &&
    record.approvedBy === "Deven Langston" &&
    record.approvalAuthority === "RVA3D owner" &&
    record.approvalSource === "direct-owner-approval"
  );
}

export function isPublicMediaEntry(value: unknown): value is DirectOwnerApproval {
  return hasDirectOwnerApproval(value);
}
