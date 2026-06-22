import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, ArrowLeft, Loader2, Wand2, Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdmissionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dob: '',
    gender: '',
    fatherName: '',
    motherName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    aadhaar: '',

    // Academic Details - 10th
    schoolName10: '',
    board10: '',
    year10: '',
    marks10: '',

    // Academic Details - 12th
    collegeName12: '',
    board12: '',
    year12: '',
    marks12: '',
    stream12: '',

    // Entrance Exam
    hallTicketEamcet: '',
    rankEamcet: '',
    scoreEamcet: '',
    yearEamcet: '',

    // Course Preferences
    preferredCourse: '',
    preferredColleges: '',
    category: '',

    // AI Assistance
    interests: '',
    skills: '',
    careerGoals: '',

    // Declaration
    confirmed: false
  });

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (field: string) => {
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[field];
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('You must be logged in to apply');
      return;
    }

    if (!formData.confirmed) {
      toast.error('Please confirm the declaration');
      return;
    }

    setIsLoading(true);
    try {
      const applicationId = `ADM-${Date.now()}`;
      await setDoc(doc(db, 'applications', applicationId), {
        id: applicationId,
        studentUid: auth.currentUser.uid,
        ...formData,
        documents: previews,
        status: 'Pending',
        createdAt: serverTimestamp()
      });

      toast.success('Admission form submitted successfully!');
      navigate('/student/status');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/student">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admission Form</h1>
            <p className="text-muted-foreground">Complete your application for MeritMatrix AI Admission System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Details */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3 p-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="fullName" 
                  required 
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth <span className="text-destructive">*</span></Label>
                <Input 
                  id="dob" 
                  type="date" 
                  required 
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                <Select required onValueChange={(v) => setFormData({...formData, gender: v})}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="fatherName" 
                  required 
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="motherName" 
                  required 
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number <span className="text-destructive">*</span></Label>
                <Input 
                  id="mobile" 
                  type="tel"
                  required 
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input 
                  id="email" 
                  type="email"
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number (Optional)</Label>
                <Input 
                  id="aadhaar" 
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="address" 
                  required 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                <Input 
                  id="city" 
                  required 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                <Input 
                  id="state" 
                  required 
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode <span className="text-destructive">*</span></Label>
                <Input 
                  id="pincode" 
                  required 
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Academic Details */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* 10th Class */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-l-4 border-primary pl-3">10th Class</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName10">School Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="schoolName10" 
                      required 
                      value={formData.schoolName10}
                      onChange={(e) => setFormData({ ...formData, schoolName10: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="board10">Board <span className="text-destructive">*</span></Label>
                    <Input 
                      id="board10" 
                      required 
                      value={formData.board10}
                      onChange={(e) => setFormData({ ...formData, board10: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year10">Year of Passing <span className="text-destructive">*</span></Label>
                    <Input 
                      id="year10" 
                      type="number"
                      required 
                      value={formData.year10}
                      onChange={(e) => setFormData({ ...formData, year10: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marks10">Marks / GPA <span className="text-destructive">*</span></Label>
                    <Input 
                      id="marks10" 
                      required 
                      value={formData.marks10}
                      onChange={(e) => setFormData({ ...formData, marks10: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 12th Class */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold text-lg border-l-4 border-primary pl-3">12th Class</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="collegeName12">College Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="collegeName12" 
                      required 
                      value={formData.collegeName12}
                      onChange={(e) => setFormData({ ...formData, collegeName12: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="board12">Board <span className="text-destructive">*</span></Label>
                    <Input 
                      id="board12" 
                      required 
                      value={formData.board12}
                      onChange={(e) => setFormData({ ...formData, board12: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year12">Year of Passing <span className="text-destructive">*</span></Label>
                    <Input 
                      id="year12" 
                      type="number"
                      required 
                      value={formData.year12}
                      onChange={(e) => setFormData({ ...formData, year12: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marks12">Marks / Percentage <span className="text-destructive">*</span></Label>
                    <Input 
                      id="marks12" 
                      required 
                      value={formData.marks12}
                      onChange={(e) => setFormData({ ...formData, marks12: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream12">Stream <span className="text-destructive">*</span></Label>
                    <Select required onValueChange={(v) => setFormData({...formData, stream12: v})}>
                      <SelectTrigger id="stream12">
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mpc">MPC (Maths, Physics, Chemistry)</SelectItem>
                        <SelectItem value="bipc">BiPC (Biology, Physics, Chemistry)</SelectItem>
                        <SelectItem value="cec">CEC</SelectItem>
                        <SelectItem value="mec">MEC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Entrance Exam Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                Entrance Exam (EAMCET)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 p-6">
              <div className="space-y-2">
                <Label htmlFor="hallTicketEamcet">Hall Ticket Number <span className="text-destructive">*</span></Label>
                <Input 
                  id="hallTicketEamcet" 
                  required 
                  value={formData.hallTicketEamcet}
                  onChange={(e) => setFormData({ ...formData, hallTicketEamcet: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rankEamcet">Rank <span className="text-destructive">*</span></Label>
                <Input 
                  id="rankEamcet" 
                  type="number"
                  required 
                  value={formData.rankEamcet}
                  onChange={(e) => setFormData({ ...formData, rankEamcet: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scoreEamcet">Score <span className="text-destructive">*</span></Label>
                <Input 
                  id="scoreEamcet" 
                  type="number"
                  required 
                  value={formData.scoreEamcet}
                  onChange={(e) => setFormData({ ...formData, scoreEamcet: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearEamcet">Exam Year <span className="text-destructive">*</span></Label>
                <Input 
                  id="yearEamcet" 
                  type="number"
                  required 
                  value={formData.yearEamcet}
                  onChange={(e) => setFormData({ ...formData, yearEamcet: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Course Preferences */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">4</span>
                Course Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 p-6">
              <div className="space-y-2">
                <Label htmlFor="preferredCourse">Preferred Course <span className="text-destructive">*</span></Label>
                <Select required onValueChange={(v) => setFormData({...formData, preferredCourse: v})}>
                  <SelectTrigger id="preferredCourse">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cse">Computer Science Engineering</SelectItem>
                    <SelectItem value="ece">Electronics & Communication</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
                    <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select required onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oc">OC</SelectItem>
                    <SelectItem value="bc">BC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="preferredColleges">Preferred Colleges (Optional)</Label>
                <Textarea 
                  id="preferredColleges" 
                  placeholder="List colleges in order of preference..."
                  value={formData.preferredColleges}
                  onChange={(e) => setFormData({ ...formData, preferredColleges: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. Document Upload Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">5</span>
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-8 md:grid-cols-2">
              {[
                { id: 'cert10', label: '10th Certificate' },
                { id: 'memo12', label: '12th Marks Memo' },
                { id: 'rankCard', label: 'EAMCET Rank Card' },
                { id: 'idProof', label: 'ID Proof (Aadhaar/Voter ID)' }
              ].map((doc) => (
                <div key={doc.id} className="space-y-3">
                  <Label className="text-sm font-semibold">{doc.label} <span className="text-destructive">*</span></Label>
                  <div className="relative group">
                    {previews[doc.id] ? (
                      <div className="relative h-40 w-full rounded-xl border-2 border-dashed border-primary/30 overflow-hidden bg-muted/50 flex items-center justify-center">
                        <img src={previews[doc.id]} alt="Preview" className="h-full w-full object-contain" />
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload {doc.label}</span>
                        <Input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, doc.id)}
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 6. AI Assistance Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">6</span>
                AI Assistance & Career Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="interests">Interests <span className="text-destructive">*</span></Label>
                <Input 
                  id="interests" 
                  placeholder="e.g. Coding, Robotics, Space Science"
                  required 
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills <span className="text-destructive">*</span></Label>
                <Input 
                  id="skills" 
                  placeholder="e.g. Python, Public Speaking, Mathematics"
                  required 
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="careerGoals">Career Goals <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="careerGoals" 
                  placeholder="Where do you see yourself in 5 years?"
                  required 
                  value={formData.careerGoals}
                  onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 7. Declaration */}
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="confirmed" 
                  checked={formData.confirmed}
                  onCheckedChange={(checked) => setFormData({ ...formData, confirmed: checked as boolean })}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="confirmed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm that all details provided are correct
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By checking this, you agree to our terms and conditions and verify that the information provided is true to the best of your knowledge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pb-10">
            <Link to="/student">
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" size="lg" className="px-8" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit Admission Form
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
