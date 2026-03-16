"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers, CheckCircle2 } from "lucide-react";

interface Course {
  label: string;
  value: string;
  req?: string;
}

interface CourseSelectorProps {
  yearLongOptions: Course[];
  trimesterOptions: Course[];
  value: {
    type: 'year' | 'trimester';
    yearCourse: string;
    trimesterCourses: [string, string, string];
  };
  onChange: (value: {
    type: 'year' | 'trimester';
    yearCourse: string;
    trimesterCourses: [string, string, string];
  }) => void;
  label?: string;
  trimesterCount?: number;
}

export function CourseSelector({ 
  yearLongOptions, 
  trimesterOptions, 
  value, 
  onChange, 
  label = "Elective",
  trimesterCount = 3 
}: CourseSelectorProps) {
  const [type, setType] = useState<'year' | 'trimester'>(value.type);
  const [yearCourse, setYearCourse] = useState(value.yearCourse);
  const [trimesterCourses, setTrimesterCourses] = useState<[string, string, string]>(value.trimesterCourses);

  // Sync internal state with props if they change externally (though typically controlled)
  useEffect(() => {
    setType(value.type);
    setYearCourse(value.yearCourse);
    setTrimesterCourses(value.trimesterCourses);
  }, [value]);

  const handleTypeChange = (newType: 'year' | 'trimester') => {
    setType(newType);
    onChange({ type: newType, yearCourse, trimesterCourses });
  };

  const handleYearChange = (val: string) => {
    setYearCourse(val);
    onChange({ type, yearCourse: val, trimesterCourses });
  };

  const handleTrimesterChange = (index: number, val: string) => {
    const newCourses = [...trimesterCourses] as [string, string, string];
    newCourses[index] = val;
    setTrimesterCourses(newCourses);
    onChange({ type, yearCourse, trimesterCourses: newCourses });
  };

  const getAvailableTrimesterOptions = (currentIndex: number) => {
    // Exclusion logic: remove courses selected in other trimesters
    if (trimesterCount <= 1) return trimesterOptions;

    return trimesterOptions.filter(opt => {
      const isSelectedElsewhere = trimesterCourses.some((selected, i) => i !== currentIndex && selected === opt.value);
      return !isSelectedElsewhere;
    });
  };

  return (
    <li className="flex items-center p-3 min-h-[60px] animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="w-20 font-bold text-muted-foreground/80 text-[10px] uppercase tracking-widest shrink-0">
        {label}
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Track Switcher */}
        <div className="flex bg-muted p-1 rounded-md shrink-0">
          <button
            onClick={() => handleTypeChange('year')}
            className={`cursor-pointer px-2 py-1 rounded-[4px] text-[10px] font-bold transition-all ${
              type === 'year' 
                ? 'bg-background text-primary shadow-xs' 
                : 'text-muted-foreground/70 hover:text-foreground'
            }`}
          >
            Year
          </button>
          <button
            onClick={() => handleTypeChange('trimester')}
            className={`cursor-pointer px-2 py-1 rounded-[4px] text-[10px] font-bold transition-all ${
              type === 'trimester' 
                ? 'bg-background text-primary shadow-xs' 
                : 'text-muted-foreground/70 hover:text-foreground'
            }`}
          >
            Tri
          </button>
        </div>
        
        {/* Selection Area */}
        <div className="flex-1 w-full">
          {type === 'year' ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <Select value={yearCourse} onValueChange={(val) => val && handleYearChange(val)}>
                <SelectTrigger className="cursor-pointer w-full h-9 text-sm font-semibold text-[#001f3f] border-none bg-secondary/10 hover:bg-secondary/20 transition-colors focus:ring-0">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {yearLongOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#001f3f] text-xs">{opt.label}</span>
                        {opt.req && <span className="text-[9px] text-muted-foreground italic">{opt.req}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className={`grid gap-2 animate-in fade-in zoom-in-95 duration-200 ${trimesterCount > 1 ? 'grid-cols-1' : 'grid-cols-1'}`}>
              {Array.from({ length: trimesterCount }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1 w-full">
                  <Select value={trimesterCourses[i]} onValueChange={(val) => val && handleTrimesterChange(i, val)}>
                    <SelectTrigger className="cursor-pointer w-full h-9 text-sm font-semibold text-[#001f3f] border-none bg-secondary/10 hover:bg-secondary/20 transition-colors focus:ring-0">
                      <SelectValue placeholder={trimesterCount > 1 ? `T${i + 1}` : "Select Course"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">{trimesterCount > 1 ? `None (T${i+1})` : "None"}</SelectItem>
                      {getAvailableTrimesterOptions(i).map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs font-semibold text-[#001f3f]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
