import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';

const profileFilePath = path.join(process.cwd(), 'customer_profile.json');

const defaultProfile = {
  name: 'Abhi Sharma',
  phone: '9876543210',
  email: '',
  country: 'India',
  state: 'Haryana',
  district: 'Gurugram',
  city: 'Gurugram',
  locality: 'Sector 14',
  pincode: '122001',
  address: 'Shop No. 4, Main Market, Sector 14, Gurugram',
  coordinates: {
    lat: 28.4595,
    lng: 77.0266
  },
  liveLocationUrl: 'https://www.google.com/maps?q=28.4595,77.0266',
  isVerified: true,
  hasDetectedGps: true
};

function ensureProfileFile() {
  if (!fs.existsSync(profileFilePath)) {
    fs.writeFileSync(profileFilePath, JSON.stringify(defaultProfile, null, 2), 'utf8');
  }
}

export async function GET() {
  try {
    ensureProfileFile();
    const data = fs.readFileSync(profileFilePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(defaultProfile);
  }
}

export async function POST(request: Request) {
  try {
    const updatedProfile = await request.json();
    ensureProfileFile();
    fs.writeFileSync(profileFilePath, JSON.stringify(updatedProfile, null, 2), 'utf8');
    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
