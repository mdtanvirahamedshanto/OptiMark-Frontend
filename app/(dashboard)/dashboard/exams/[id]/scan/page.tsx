"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { MultiImageUploader } from "@/components/scan/MultiImageUploader";
import { JobStatusTable } from "@/components/scan/JobStatusTable";
import { ScanBatch } from "@/lib/api/types";
import { useToast } from "@/components/ui/Toast";
import { getToken } from "@/lib/auth";

const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_V1_URL || "http://localhost:8000/v1";

export default function ScanPageV1() {
  const params = useParams();
  const examId = params.id as string;
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [batch, setBatch] = useState<ScanBatch | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchBatch = useCallback(
    async (batchId: number) => {
      const token = session?.backendAccessToken || getToken();
      if (!token) return;
      const res = await fetch(`${baseUrl}/scan-batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        setBatch(await res.json());
      }
    },
    [session],
  );

  const createBatch = async (files: File[]) => {
    const token = session?.backendAccessToken || getToken();
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const idempotencyKey = crypto.randomUUID();
      const res = await fetch(`${baseUrl}/exams/${examId}/scan-batches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to create scan batch");
      }

      const data = await res.json();
      setBatch(data);
      addToast("Scan jobs queued", "success");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to upload scans",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!batch?.id) return;
    const timer = setInterval(() => {
      fetchBatch(batch.id);
    }, 3000);
    return () => clearInterval(timer);
  }, [batch?.id, fetchBatch]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Upload and Scan</h1>

      <MultiImageUploader onSubmit={createBatch} loading={uploading} />

      {batch && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Batch #{batch.id} · {batch.processed_files}/{batch.total_files}{" "}
            processed · {batch.status}
          </p>
          <JobStatusTable jobs={batch.jobs} />
        </div>
      )}
    </div>
  );
}
