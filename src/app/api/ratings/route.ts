import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store ratings in a JSON file in the project root (persists across requests)
const DATA_FILE = path.join(process.cwd(), 'ratings-data.json');

interface RatingsData {
  thumbsCount: number;
  starCounts: Record<string, number>; // "1" through "5"
  totalRaters: number;
}

function readData(): RatingsData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {}
  return { thumbsCount: 0, starCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }, totalRaters: 0 };
}

function writeData(data: RatingsData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: return current counts
export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

// POST: record a new rating
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { thumbed, stars } = body as { thumbed?: boolean; stars?: number };

  const data = readData();

  if (thumbed === true) {
    data.thumbsCount += 1;
  }

  if (stars && stars >= 1 && stars <= 5) {
    const key = String(stars);
    data.starCounts[key] = (data.starCounts[key] || 0) + 1;
  }

  if (thumbed === true || (stars && stars >= 1)) {
    data.totalRaters += 1;
  }

  writeData(data);
  return NextResponse.json(data);
}
