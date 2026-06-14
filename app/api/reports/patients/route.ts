import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function GET() {
  try {
    const patients = await dbService.getPatients();
    const totalPatients = patients.length;

    // Calculate gender split
    const genderSplit = patients.reduce((acc: Record<string, number>, curr: any) => {
      const g = curr.gender || "Unknown";
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    // Calculate age splits (mock/calculated age)
    const ageDemographics = patients.reduce((acc: Record<string, number>, curr: any) => {
      const age = curr.age || 35;
      if (age < 18) acc["Pediatric (<18)"] = (acc["Pediatric (<18)"] || 0) + 1;
      else if (age < 60) acc["Adult (18-59)"] = (acc["Adult (18-59)"] || 0) + 1;
      else acc["Senior (60+)"] = (acc["Senior (60+)"] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        total_patients: totalPatients,
        gender_demographics: genderSplit,
        age_demographics: ageDemographics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
