import { useState } from 'react';
import { Flag, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DataTable, Button, Modal, StatusBadge, EmptyState } from '@/components/ui';
import { useReports } from '@/hooks';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Report } from '@/types';

export function ReportsPage() {
  const { data: reports, isLoading } = useReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleStatusUpdate = async (reportId: string, status: string) => {
    const { db } = await import('@/services');
    await db.updateReport(reportId, { status: status as Report['status'] });
  };

  const columns = [
    {
      key: 'reason',
      header: 'Reason',
      sortable: true,
      render: (r: Report) => (
        <div>
          <p className="text-white font-medium capitalize">{r.reason}</p>
          <p className="text-xs text-text-secondary">{r.description?.slice(0, 60)}</p>
        </div>
      ),
    },
    {
      key: 'reporter',
      header: 'Reporter',
      render: (r: Report) => (
        <span className="text-text-secondary">{r.reporter?.display_name || 'Unknown'}</span>
      ),
    },
    {
      key: 'track',
      header: 'Track',
      render: (r: Report) => (
        <span className="text-text-secondary">{r.track?.title || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Report) => <StatusBadge status={r.status} />,
    },
    {
      key: 'created_at',
      header: 'Submitted',
      render: (r: Report) => (
        <span className="text-text-secondary">{formatRelativeTime(r.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (r: Report) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setSelectedReport(r); }}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white">
            <Eye size={14} />
          </button>
          {r.status === 'pending' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(r.id, 'resolved'); }}
                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-text-secondary hover:text-emerald-400">
                <CheckCircle size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(r.id, 'dismissed'); }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400">
                <XCircle size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-text-secondary text-sm mt-1">Moderation queue and content reports</p>
      </div>

      {reports?.length === 0 && !isLoading ? (
        <EmptyState icon={Flag} title="No reports" description="All clear! No pending reports." />
      ) : (
        <DataTable
          columns={columns}
          data={reports || []}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          searchKeys={['reason', 'description']}
        />
      )}

      <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title="Report Details" size="md">
        {selectedReport && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary">Reason</p>
              <p className="text-white font-medium capitalize">{selectedReport.reason}</p>
            </div>
            {selectedReport.description && (
              <div>
                <p className="text-sm text-text-secondary">Description</p>
                <p className="text-white">{selectedReport.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Reporter</p>
                <p className="text-white">{selectedReport.reporter?.display_name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Status</p>
                <StatusBadge status={selectedReport.status} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              {selectedReport.status === 'pending' && (
                <>
                  <Button variant="danger" onClick={() => { handleStatusUpdate(selectedReport.id, 'dismissed'); setSelectedReport(null); }}>
                    Dismiss
                  </Button>
                  <Button onClick={() => { handleStatusUpdate(selectedReport.id, 'resolved'); setSelectedReport(null); }}>
                    Resolve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
