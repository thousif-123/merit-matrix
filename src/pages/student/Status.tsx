import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, ArrowLeft, CheckCircle2, Clock, ShieldAlert, FileSearch, UserCheck, CheckCircle, Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { detectFraud, getFinalDecision } from '@/lib/gemini';
import { toast } from 'sonner';

export default function ApplicationStatus() {
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'applications'), where('studentUid', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setApplication(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplication();
  }, []);

  const runEvaluation = async () => {
    if (!application) return;
    setIsProcessing(true);
    try {
      // 1. Run Fraud Detection
      const fraudResult = await detectFraud(
        JSON.stringify({
          name: application.fullName,
          marks10: application.marks10,
          marks12: application.marks12,
          eamcetRank: application.rankEamcet
        }),
        application.ocrData || ''
      );

      // 2. Get Final Decision
      const decisionResult = await getFinalDecision({
        name: application.fullName,
        marks10: application.marks10,
        marks12: application.marks12,
        eamcetRank: application.rankEamcet,
        fraudScore: fraudResult.fraudScore,
        careerGoals: application.careerGoals
      });

      // 3. Update Firestore
      const appRef = doc(db, 'applications', application.id);
      await updateDoc(appRef, {
        fraudScore: fraudResult.fraudScore,
        aiRecommendation: decisionResult.decision,
        feedback: decisionResult.feedback,
        status: decisionResult.decision === 'Approved' ? 'Approved' : 'Rejected'
      });

      // Refresh local state
      setApplication({
        ...application,
        fraudScore: fraudResult.fraudScore,
        aiRecommendation: decisionResult.decision,
        feedback: decisionResult.feedback,
        status: decisionResult.decision === 'Approved' ? 'Approved' : 'Rejected'
      });

      toast.success('AI Evaluation complete!');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('AI Evaluation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Application Found</h2>
        <p className="text-muted-foreground mb-8">You haven't submitted an application yet.</p>
        <Link to="/student/form">
          <Button>Start Application</Button>
        </Link>
      </div>
    );
  }

  const stages = [
    { id: 1, name: 'Form Submitted', status: 'completed', icon: <CheckCircle2 className="h-5 w-5" /> },
    { id: 2, name: 'Document Verification', status: application.documents ? 'completed' : 'processing', icon: <FileSearch className="h-5 w-5" /> },
    { id: 3, name: 'Fraud Detection', status: application.fraudScore !== undefined ? 'completed' : (application.documents ? 'processing' : 'pending'), icon: <ShieldAlert className="h-5 w-5" /> },
    { id: 4, name: 'Final Evaluation', status: application.status === 'Approved' || application.status === 'Rejected' ? 'completed' : 'pending', icon: <UserCheck className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/student">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Application Pipeline</h1>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Current Status: {application.status}</CardTitle>
                  <CardDescription>Application ID: {application.id}</CardDescription>
                </div>
                <Badge variant={application.status === 'Approved' ? 'secondary' : application.status === 'Rejected' ? 'destructive' : 'outline'} className={application.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}>
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                {stages.map((stage, i) => (
                  <div key={stage.id} className="relative flex items-center gap-6">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10 bg-background ${
                      stage.status === 'completed' ? 'border-green-500 text-green-500' : 
                      stage.status === 'processing' ? 'border-primary text-primary animate-pulse' : 
                      'border-muted text-muted-foreground'
                    }`}>
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${stage.status === 'pending' ? 'text-muted-foreground' : ''}`}>
                          {stage.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {stage.status === 'completed' ? 'Completed' : stage.status === 'processing' ? 'In Progress' : 'Waiting'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stage.id === 1 && "Basic details and career profile successfully recorded."}
                        {stage.id === 2 && (application.documents ? "Documents uploaded and verified." : "Waiting for document upload.")}
                        {stage.id === 3 && (application.fraudScore !== undefined ? `Fraud check complete. Score: ${application.fraudScore}%` : "AI is checking for data mismatches.")}
                        {stage.id === 4 && (application.status === 'Approved' || application.status === 'Rejected' ? `Final decision: ${application.status}` : "Final decision based on academic and fraud score.")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {application.documents && !application.fraudScore && (
                <div className="mt-8 pt-6 border-t flex justify-center">
                  <Button onClick={runEvaluation} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running AI Evaluation...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Run AI Fraud & Evaluation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Fraud Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Risk Level: {application.fraudScore > 80 ? 'Low' : application.fraudScore > 50 ? 'Medium' : application.fraudScore !== undefined ? 'High' : 'N/A'}</span>
                  <span className={`text-sm font-bold ${application.fraudScore > 80 ? 'text-green-600' : 'text-red-600'}`}>
                    {application.fraudScore !== undefined ? `${application.fraudScore}% Authentic` : 'Pending'}
                  </span>
                </div>
                <Progress value={application.fraudScore || 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-4">
                  {application.fraudScore !== undefined 
                    ? "AI has compared your form data with OCR results. No major discrepancies found."
                    : "Fraud detection will run after OCR processing is complete."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  {application.feedback || "Your application is currently being evaluated by our AI system. Feedback will appear here once the process is complete."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
