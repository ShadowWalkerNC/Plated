import { useState } from 'react';
import type { ProjectSchema } from '@plated/types';

const API = (window as any).plated as Record<string, (...a: any[]) => Promise<any>> | undefined;

interface ExportResult {
  ok:           boolean;
  filePath?:    string;
  filesWritten?: number;
  reason?:      string;
}

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);

  async function exportZip(schema: ProjectSchema) {
    setExporting(true);
    try {
      const result = await API?.exportZip?.(schema) as ExportResult;
      setLastResult(result);
      return result;
    } finally {
      setExporting(false);
    }
  }

  async function exportFolder(schema: ProjectSchema) {
    setExporting(true);
    try {
      const result = await API?.exportFolder?.(schema) as ExportResult;
      setLastResult(result);
      return result;
    } finally {
      setExporting(false);
    }
  }

  return { exporting, lastResult, exportZip, exportFolder };
}
