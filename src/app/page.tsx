"use client";

import { Planner, SCHOOLS, SchoolId } from "@/components/Planner";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolId>('plms');
  const schoolData = SCHOOLS[selectedSchool];

  return (
    <main className="min-h-screen bg-background border-t-2 border-primary pb-12">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left: Branding */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h1 className="text-3xl font-black tracking-tight text-primary">
                Middle School Course Selector
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">{schoolData.district}</p>
            </div>

            {/* Right: Actions (Selectors) */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">School</span>
                <div className="w-[400px]">
                  <Select value={selectedSchool} onValueChange={(v) => setSelectedSchool(v as SchoolId)}>
                    <SelectTrigger className="h-12 text-sm bg-white border-primary/20 font-bold text-primary px-4 shadow-sm hover:bg-white transition-all rounded-xl">
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl overflow-hidden min-w-[400px]">
                      {Object.values(SCHOOLS).map((school) => (
                        <SelectItem key={school.id} value={school.id} className="cursor-pointer py-3 focus:bg-primary/5">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-primary">{school.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black">{school.district}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="px-4 py-1.5 rounded-lg text-xs font-black bg-primary text-[#FFB81C] shadow-sm uppercase tracking-wider min-w-[140px] text-center">
                {schoolData.motto}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Planner selectedSchool={selectedSchool} onSchoolChange={setSelectedSchool} />

        {/* Important Disclaimer */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-4 rounded-lg shadow-sm flex items-start gap-4 mx-auto max-w-4xl">
          <svg className="w-6 h-6 text-yellow-500 mt-1 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div>
            <strong className="font-semibold block mb-1 text-base">Community Project Notice</strong>
            This is an independent student project created to assist families with academic planning. <strong>It is not an official tool provided by the Middle School or the School District.</strong> Information is based on the 2026-2027 course guide but families should independently verify requirements with their school counselors.
          </div>
        </div>
      </div>
    </main>
  );
}
