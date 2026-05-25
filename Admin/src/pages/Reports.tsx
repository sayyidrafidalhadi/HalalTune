import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle,
  Flag,
  ShieldAlert,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Loader2,
  FileText
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "reports"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          Incident Reports
        </h1>
        <p className="text-white/40 mt-2 font-medium">Handle copyright claims and community violations.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Target Item</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Retrieving Reports...</p>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <ShieldAlert className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-medium">Clear skies! No reports to handle.</p>
                </TableCell>
              </TableRow>
            ) : reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-bold">{report.reporterName || 'Anonymous'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-white/80">{report.targetTitle}</span>
                    <span className="text-[10px] text-white/30 uppercase font-bold">{report.targetType}</span>
                  </div>
                </TableCell>
                <TableCell className="text-white/60 text-sm max-w-xs truncate">{report.reason}</TableCell>
                <TableCell>
                  <div className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border", getUrgencyColor(report.urgency))}>
                    {report.urgency}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={report.status === 'resolved' ? "halal" : "secondary"}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-xl transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
