import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users as UsersIcon,
  Search,
  MoreVertical,
  Loader2,
  ShieldCheck,
  Ban,
  Mail,
  Calendar
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            User Directory
          </h1>
          <p className="text-white/40 mt-2 font-medium text-sm lg:text-base">Manage platform members and permissions.</p>
        </div>
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-all w-full"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Retrieving Members...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <UsersIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-medium">No users found in the directory.</p>
                </TableCell>
              </TableRow>
            ) : users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : (user.displayName?.[0] || 'U')}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.displayName || 'Unnamed User'}</p>
                      <p className="text-xs text-white/30 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.subscription === 'premium' ? "halal" : "outline"}>
                    {user.subscription || 'free'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Calendar className="w-4 h-4" />
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    user.isBanned ? "bg-red-500" : "bg-emerald-500"
                  )} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                      <Ban className="w-4 h-4 text-red-500/50 hover:text-red-500" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4 text-white/40" />
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
