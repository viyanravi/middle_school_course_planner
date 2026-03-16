"use client";

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, Download, Lock, Calendar, Layers } from "lucide-react";
import { CourseSelector } from "./CourseSelector";

// --- Types ---
export type SchoolId = 'plms' | 'blms' | 'ems';
type MathPathway = 'PathA' | 'PathB' | 'PathC' | 'PathD';
type ScienceSequence = 'Standard' | 'Alternate';
type LAPathway = 'Regular' | 'Advanced';
type MusicChoice = 'None' | 'Band' | 'Orchestra' | 'Chorus';

export interface SchoolData {
  id: SchoolId;
  name: string;
  district: string;
  motto: string;
  logo: string;
}

export const SCHOOLS: Record<SchoolId, SchoolData> = {
  plms: { id: 'plms', name: 'Pine Lake Middle School', district: 'Issaquah School District', motto: 'Wolverine Pride', logo: '/logos/plms.svg' },
  blms: { id: 'blms', name: 'Beaver Lake Middle School', district: 'Issaquah School District', motto: 'Bulldog Pledge', logo: '/logos/blms.svg' },
  ems: { id: 'ems', name: 'Evergreen Middle School', district: 'Lake Washington School District', motto: 'Eagles Soar', logo: '/logos/ems.png' }
};

interface ElectiveState {
  type: 'year' | 'trimester';
  yearCourse: string;
  trimesterCourses: [string, string, string];
}

interface PlannerState {
  school: SchoolId;
  mathPathway: MathPathway;
  scienceSequence: ScienceSequence;
  languageArtsPathway: LAPathway;
  elective6th: ElectiveState;
  elective7th: ElectiveState;
  elective8th1: ElectiveState;
  elective8th2: ElectiveState;
  healthPeWaiver: boolean;
}

interface PlannerProps {
  selectedSchool?: SchoolId;
  onSchoolChange?: (school: SchoolId) => void;
}

export function Planner({ selectedSchool = 'plms', onSchoolChange }: PlannerProps) {
  const [state, setState] = useState<PlannerState>({
    school: selectedSchool,
    mathPathway: 'PathA',
    scienceSequence: 'Standard',
    languageArtsPathway: 'Regular',
    elective6th: { type: 'year', yearCourse: 'Band', trimesterCourses: ['Woods 1 / Art 1 / CS 1', 'None', 'None'] },
    elective7th: { type: 'year', yearCourse: 'Band', trimesterCourses: ['Digital Photography', 'None', 'None'] },
    elective8th1: { type: 'year', yearCourse: 'Spanish 1A', trimesterCourses: ['None', 'None', 'None'] },
    elective8th2: { type: 'year', yearCourse: 'None', trimesterCourses: ['None', 'None', 'None'] },
    healthPeWaiver: false,
  });

  // Sync school if changed from parent (header)
  React.useEffect(() => {
    if (selectedSchool !== state.school) {
      setState(s => ({ ...s, school: selectedSchool }));
    }
  }, [selectedSchool]);

  const [showPathDModal, setShowPathDModal] = useState(false);

  // Core Rules
  const getMathCourse = (grade: number) => {
    if (state.mathPathway === 'PathA') return grade === 6 ? 'Math 1' : grade === 7 ? 'Math 2' : 'Math 3';
    if (state.mathPathway === 'PathB') return grade === 6 ? 'Math 1-2' : grade === 7 ? 'Math 2-3' : 'Algebra 1 (HS)';
    if (state.mathPathway === 'PathC') return grade === 6 ? 'Math 2-3' : grade === 7 ? 'Algebra 1 (HS)' : 'Geometry (HS)';
    return grade === 6 ? 'Algebra 1 (HS)' : grade === 7 ? 'Adv. Geometry (HS)' : 'Adv. Algebra 2/Trig (HS)';
  };

  const getScienceCourse = (grade: number) => {
    if (state.scienceSequence === 'Standard') return grade === 6 ? 'Life Science' : grade === 7 ? 'Earth & Space Science' : 'Physical Science';
    return grade === 6 ? 'Earth & Space Science' : grade === 7 ? 'Physical Science' : 'Biology (HS)';
  };

  const getLACourse = () => {
    return state.languageArtsPathway === 'Advanced' ? 'Adv. Language Arts' : 'Language Arts';
  };

  const getSSCourse = (grade: number) => {
    if (state.school === 'ems') {
      return grade === 6 ? 'Ancient World History' : grade === 7 ? 'U.S. History' : 'World History';
    }
    return grade === 6 ? 'World Studies' : grade === 7 ? 'WA State / US History' : 'US History';
  };

  // Elective Constraints
  const hasCS1 = state.elective6th.type === 'trimester'; // 6th Grade Trimester Rotation includes CS1

  const yearLongElectives = [
    { label: "Band", value: "Band" },
    { label: "Orchestra", value: "Orchestra" },
    { label: "Chorus", value: "Chorus" },
    { label: "Spanish 1A", value: "Spanish 1A" },
    { label: "Spanish 1B (HS)", value: "Spanish 1B (HS)", req: "Requires Spanish 1A" },
  ];

  const trimesterElectives = [
    { label: "Digital Photography", value: "Digital Photography" },
    { label: "Integrated Projects", value: "Integrated Projects" },
    { label: "Woods 1", value: "Woods 1" },
    { label: "Woods 2", value: "Woods 2" },
    { label: "Arts & Crafts", value: "Arts & Crafts" },
    { label: "3D Art", value: "3D Art" },
    { label: "Computer Science 2", value: "Computer Science 2", req: "Requires CS 1" },
    { label: "Computer Science 3", value: "Computer Science 3", req: "Requires CS 2" },
    { label: "Film Making", value: "Film Making" },
    { label: "Speech & Debate", value: "Speech & Debate" },
    { label: "Adv. Speech & Debate", value: "Adv. Speech & Debate" },
    { label: "Yearbook Design", value: "Yearbook Design" },
    { label: "Leadership", value: "Leadership" },
    { label: "Peer Partner", value: "Peer Partner" },
  ];

  const handleMathChange = (val: any) => {
    if (!val) return;
    if (val === 'PathD') {
      setShowPathDModal(true);
    } else {
      setState(s => ({ ...s, mathPathway: val as MathPathway }));
    }
  };

  const confirmPathD = () => {
    setState(s => ({ ...s, mathPathway: 'PathD' }));
    setShowPathDModal(false);
  };
  const cancelPathD = () => setShowPathDModal(false);

  const generatePDF = async () => {
    const element = document.getElementById('academic-roadmap');
    if (!element) return;
    
    // Ensure the button itself is hidden or not captured if it's inside the element
    // Actually, it's outside in Planner.tsx usually.

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: false, // Assets are now local in /public, CORS is not needed and can sometimes block
        allowTaint: true, // Allow local images to be drawn
        backgroundColor: '#ffffff',
        logging: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('academic-roadmap');
          if (el) {
            el.style.padding = '30px';
            el.style.backgroundColor = '#ffffff';
            
            // Targeted overrides for Tailwind 4's oklab/oklch defaults
            const fix = (selector: string, styles: Partial<CSSStyleDeclaration>) => {
              el.querySelectorAll(selector).forEach((node) => {
                const e = node as HTMLElement;
                Object.assign(e.style, styles);
                // Also use setProperty for important
                Object.entries(styles).forEach(([prop, val]) => {
                  if (val) e.style.setProperty(prop.replace(/[A-Z]/g, m => "-" + m.toLowerCase()), val as string, 'important');
                });
              });
            };

            fix('.bg-slate-50', { backgroundColor: '#f8fafc' });
            fix('.bg-card', { backgroundColor: '#ffffff' });
            fix('.border-border', { borderColor: '#e2e8f0' });
            fix('.bg-primary', { backgroundColor: '#001f3f', color: '#ffffff' });
            fix('.bg-secondary', { backgroundColor: '#f1f5f9', color: '#001f3f' });
            fix('.text-primary', { color: '#001f3f' });
            fix('.text-muted-foreground', { color: '#64748b' });
            
            // Kill all shadows and outlines which usually use oklab
            el.querySelectorAll('*').forEach((node) => {
              const e = node as HTMLElement;
              e.style.setProperty('box-shadow', 'none', 'important');
              e.style.setProperty('outline', 'none', 'important');
              e.style.setProperty('outline-color', 'transparent', 'important');
              e.style.setProperty('text-shadow', 'none', 'important');
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = canvas.width / canvas.height;
      let width = pdfWidth - 20;
      let height = width / ratio;

      if (height > pdfHeight - 20) {
        height = pdfHeight - 20;
        width = height * ratio;
      }

      pdf.setFontSize(14);
      pdf.setTextColor('#001f3f');
      pdf.text(`${SCHOOLS[state.school].name} - 3-Year Academic Outlook`, 10, 10);
      
      pdf.addImage(imgData, 'PNG', 10, 15, width, height, undefined, 'FAST');
      pdf.save(`${state.school}-academic-outlook.pdf`);
    } catch (err) {
      console.error('PDF Generation Detail:', err);
      alert('PDF Generation failed. This usually happens if images are still loading or if the browser blocks canvas generation. Please refresh and try again.');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Settings / Global Toggles */}
      <fieldset className="border-2 border-primary/20 rounded-xl p-6 bg-card/50 backdrop-blur-sm shadow-sm">
        <legend className="px-2.5 ml-6 text-sm font-bold text-primary flex items-center gap-2 bg-background rounded-full border border-primary/10 py-0.5 shadow-sm">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Core Pathways
        </legend>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <Label className="font-bold text-primary min-w-[120px] shrink-0">Math Pathway</Label>
            <Select value={state.mathPathway} onValueChange={handleMathChange}>
              <SelectTrigger className="h-10 text-base flex-1 bg-secondary/10 border-primary/20 focus:ring-primary/30">
                <SelectValue placeholder="Select Pathway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PathA">Path A (Standard)</SelectItem>
                <SelectItem value="PathB">Path B (Compacted)</SelectItem>
                <SelectItem value="PathC">Path C (Compacted Accelerated)</SelectItem>
                <SelectItem value="PathD">Path D (Accelerated)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <Label className="font-bold text-primary min-w-[120px] shrink-0">Science</Label>
            <Select value={state.scienceSequence} onValueChange={(v) => v && setState(s => ({ ...s, scienceSequence: v as ScienceSequence }))}>
              <SelectTrigger className="h-10 text-base flex-1 bg-secondary/10 border-primary/20 focus:ring-primary/30">
                <SelectValue placeholder="Select Sequence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard Sequence</SelectItem>
                <SelectItem value="Alternate">Alternate Sequence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <Label className="font-bold text-primary min-w-[120px] shrink-0">Language Arts</Label>
            <Select value={state.languageArtsPathway} onValueChange={(v) => v && setState(s => ({ ...s, languageArtsPathway: v as LAPathway }))}>
              <SelectTrigger className="h-10 text-base flex-1 bg-secondary/10 border-primary/20 focus:ring-primary/30">
                <SelectValue placeholder="Select Pathway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* Roadmap Interface */}
      <h2 className="text-xl font-semibold tracking-tight mt-8 mb-2">Your Academic Roadmap</h2>
      
      <div id="academic-roadmap" className="grid lg:grid-cols-3 gap-6 bg-background rounded-xl p-2">
        
        {/* 6th Grade */}
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
          <CardHeader className="pb-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-[#001f3f]">6th Grade</CardTitle>
              <Badge className="bg-[#001f3f] text-white hover:bg-[#001f3f]/90 border-none rounded-full px-4 py-1">7 Periods</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <PeriodItem num="Homeroom" name="Homeroom / Advisory" locked />
              <PeriodItem 
                num="Period 1" 
                name={getLACourse()} 
                locked 
                badge="Core"
              />
              <PeriodItem 
                num="Period 2" 
                name={getSSCourse(6)} 
                locked 
                badge="Core"
              />
              <PeriodItem num="Period 3" name={getMathCourse(6)} highlight isHsCredit={getMathCourse(6).includes('(HS)')} />
              <PeriodItem num="Period 4" name={getScienceCourse(6)} highlight isHsCredit={getScienceCourse(6).includes('(HS)')} />
              <PeriodItem num="Period 5" name="Health (1T) / P.E. (2T)" locked />
                <CourseSelector 
                  label="Period 6 Elective"
                  yearLongOptions={yearLongElectives.filter(e => !e.value.includes('Spanish'))}
                  trimesterOptions={[{ label: "Woods 1 / Art 1 / CS 1", value: "Woods 1 / Art 1 / CS 1" }]}
                  trimesterCount={1}
                  value={state.elective6th}
                  onChange={(val) => setState(s => ({ ...s, elective6th: val }))}
                />
            </ul>
          </CardContent>
        </Card>

        {/* 7th Grade */}
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
          <CardHeader className="pb-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-[#001f3f]">7th Grade</CardTitle>
              <Badge className="bg-[#001f3f] text-white hover:bg-[#001f3f]/90 border-none rounded-full px-4 py-1">7 Periods</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <PeriodItem num="Homeroom" name="Homeroom / Advisory" locked />
              <PeriodItem 
                num="Period 1" 
                name={getLACourse()} 
                locked 
                badge="Core"
              />
              <PeriodItem 
                num="Period 2" 
                name={getSSCourse(7)} 
                locked 
                badge="Core"
              />
              <PeriodItem num="Period 3" name={getMathCourse(7)} highlight isHsCredit={getMathCourse(7).includes('(HS)')} />
              <PeriodItem num="Period 4" name={getScienceCourse(7)} highlight isHsCredit={getScienceCourse(7).includes('(HS)')} />
              <PeriodItem num="Period 5" name="Health (1T) / P.E. (2T)" locked />
                <CourseSelector 
                  label="Period 6 Elective"
                  yearLongOptions={yearLongElectives.filter(e => e.value !== 'Spanish 1B (HS)')}
                  trimesterOptions={trimesterElectives}
                  value={state.elective7th}
                  onChange={(val) => setState(s => ({ ...s, elective7th: val }))}
                />
            </ul>
          </CardContent>
        </Card>

        {/* 8th Grade */}
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
          <CardHeader className="pb-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-[#001f3f]">8th Grade</CardTitle>
              <Badge className="bg-[#001f3f] text-white hover:bg-[#001f3f]/90 border-none rounded-full px-4 py-1">7 Periods</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <PeriodItem num="Homeroom" name="Homeroom / Advisory" locked />
              <PeriodItem 
                num="Period 1" 
                name={getLACourse()} 
                locked 
                badge="Core"
              />
              <PeriodItem 
                num="Period 2" 
                name={getSSCourse(8)} 
                locked 
                badge="Core"
              />
              <PeriodItem num="Period 3" name={getMathCourse(8)} highlight isHsCredit={getMathCourse(8).includes('(HS)')} />
              <PeriodItem num="Period 4" name={getScienceCourse(8)} highlight isHsCredit={getScienceCourse(8).includes('(HS)')} />
              
              <li className="px-3 py-4 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between border-l-2 border-l-amber-500/50">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="pe-waiver-8" className="text-sm font-semibold text-amber-900 dark:text-amber-200 cursor-pointer">Health/PE Waiver</Label>
                  <span className="text-[10px] text-amber-700/70 dark:text-amber-400/60 font-medium">Independent Health and PE 8</span>
                </div>
                <Switch 
                  id="pe-waiver-8" 
                  checked={state.healthPeWaiver} 
                  onCheckedChange={(v) => setState(s => ({ ...s, healthPeWaiver: v, elective8th2: v ? s.elective8th2 : { type: 'trimester', yearCourse: 'None', trimesterCourses: ['None', 'None', 'None'] } }))}
                  className="data-[state=checked]:bg-amber-600"
                />
              </li>

              {!state.healthPeWaiver ? (
                <PeriodItem num="Period 5" name="Health (1T) / P.E. (2T)" locked />
              ) : (
                  <CourseSelector 
                    label="Period 5 Waiver Elective"
                    yearLongOptions={yearLongElectives}
                    trimesterOptions={trimesterElectives}
                    value={state.elective8th2}
                    onChange={(val) => setState(s => ({ ...s, elective8th2: val }))}
                  />
              )}
              
                <CourseSelector 
                  label="Period 6 Elective"
                  yearLongOptions={yearLongElectives}
                  trimesterOptions={trimesterElectives}
                  value={state.elective8th1}
                  onChange={(val) => setState(s => ({ ...s, elective8th1: val }))}
                />
            </ul>
          </CardContent>
        </Card>
        
      </div>



      {/* Path D Modal */}
      <Dialog open={showPathDModal} onOpenChange={setShowPathDModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Path D Requirements
            </DialogTitle>
            <DialogDescription>
              Selecting Math Path D requires meeting strict Issaquah School District placement criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <Alert className="bg-secondary/10 border-secondary/50">
              <Info className="h-4 w-4 text-secondary-foreground" />
              <AlertTitle>Placement Test Eligibility</AlertTitle>
              <AlertDescription className="text-sm mt-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Winter i-Ready Math Score: <strong className="text-foreground">4.20+</strong></li>
                  <li>Algebra Readiness Test: <strong className="text-foreground">85%+</strong></li>
                </ul>
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>High School Transcript</AlertTitle>
              <AlertDescription className="text-sm">
                Algebra 1 in 6th grade will appear on the High School Transcript and count towards High School Credits.
                <br/><br/>
                <strong>Note:</strong> 8th graders on Path D typically attend the high school for 1st period and require private transportation.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelPathD}>Cancel</Button>
            <Button onClick={confirmPathD}>Acknowledge & Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function PeriodItem({ num, name, locked, highlight, active, isHsCredit, badge }: any) {
  return (
    <li className={`flex items-center p-3 text-sm min-h-[60px] ${highlight ? 'bg-primary/5 dark:bg-primary/10' : ''} ${active ? 'bg-secondary/10 border-l-2 border-l-secondary' : ''}`}>
      <div className="w-20 font-bold text-muted-foreground/80 text-[10px] uppercase tracking-widest shrink-0">{num}</div>
      <div className={`flex-1 flex flex-wrap items-center justify-between gap-2`}>
        <div className={`font-semibold ${locked ? 'text-[#001f3f]/80' : 'text-[#001f3f]'} truncate`}>
          {name}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {badge && <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary bg-primary/5">{badge}</Badge>}
          {highlight && <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', fontSize: '9px', padding: '0 6px', height: '16px', borderRadius: '9999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>Dynamic</span>}
          {isHsCredit && <Badge className="bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20 text-[9px] px-1.5 py-0 h-4 hover:bg-green-600/20">HS Credit</Badge>}
        </div>
      </div>
    </li>
  );
}
