import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, FileText, Upload, CheckCircle, Clock, LayoutDashboard, User, LogOut, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { recommendCourses } from '@/lib/gemini';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'applications'), where('studentUid', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const appData = querySnapshot.docs[0].data();
          setApplication(appData);
          
          // Fetch recommendations if marks are available
          if (appData.marks12) {
            setIsRecommending(true);
            const recs = await recommendCourses({
              marks12: appData.marks12,
              marks10: appData.marks10,
              rankEamcet: appData.rankEamcet
            }, appData.interests);
            setRecommendations(recs || []);
            setIsRecommending(false);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplication();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {auth.currentUser?.displayName?.split(' ')[0] || 'Student'}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your application.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Application Status</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{application?.status || 'Not Started'}</div>
              <p className="text-xs text-muted-foreground">
                {application ? 'Updated recently' : 'Start your journey today'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{application?.documents ? 'Uploaded' : 'Pending'}</div>
              <p className="text-xs text-muted-foreground">
                {application?.documents ? 'All documents received' : 'Upload your certificates in the form'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Complete your application process</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!application && (
                <Link to="/student/apply">
                  <Button className="w-full justify-between" variant="outline">
                    Fill Admission Form <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link to="/student/status">
                <Button className="w-full justify-between" variant="outline">
                  Track Application <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Based on your profile and marks</CardDescription>
            </CardHeader>
            <CardContent>
              {isRecommending ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recommendations.length > 0 ? (
                <ul className="space-y-4">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px] h-4">
                          {rec.match} Match
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Submit your marks to get personalized course recommendations.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
