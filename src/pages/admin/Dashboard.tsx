import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Search, Filter, LayoutDashboard, Users, FileText, Settings, LogOut, Eye, MoreVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(apps);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status: newStatus });
      setApplications(applications.map(app => app.id === id ? { ...app, status: newStatus } : app));
      toast.success(`Application ${id} ${newStatus}`);
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredApplications = applications.filter(app => 
    (app.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending' || app.status === 'Under Review').length,
    avgFraud: applications.length > 0 
      ? Math.round(applications.reduce((acc, app) => acc + (app.fraudScore || 0), 0) / applications.length)
      : 0
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and review student applications.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Applications received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Fraud Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.avgFraud > 80 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.avgFraud}% Authentic
              </div>
              <p className="text-xs text-muted-foreground">Overall integrity</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>AI-assisted review and decision making.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>10th Marks</TableHead>
                    <TableHead>12th Marks</TableHead>
                    <TableHead>Fraud Score</TableHead>
                    <TableHead>AI Rec.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-medium">{app.fullName}</div>
                        <div className="text-xs text-muted-foreground">{app.id}</div>
                      </TableCell>
                      <TableCell>{app.marks10}%</TableCell>
                      <TableCell>{app.marks12}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-12 rounded-full ${app.fraudScore > 80 ? 'bg-green-200' : 'bg-red-200'}`}>
                            <div 
                              className={`h-full rounded-full ${app.fraudScore > 80 ? 'bg-green-500' : 'bg-red-500'}`} 
                              style={{ width: `${app.fraudScore || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{app.fraudScore !== undefined ? `${app.fraudScore}%` : 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.aiRecommendation === 'Approved' ? 'secondary' : 'destructive'} className={app.aiRecommendation === 'Approved' ? 'bg-green-100 text-green-800' : ''}>
                          {app.aiRecommendation || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600" 
                            title="Approve"
                            onClick={() => handleAction(app.id, 'Approved')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive" 
                            title="Reject"
                            onClick={() => handleAction(app.id, 'Rejected')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredApplications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
