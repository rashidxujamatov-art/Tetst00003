import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildOfficialReport } from "@/lib/pdf";
import { loadReportData, safeName } from "@/lib/report-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const data = await loadReportData(params.id);
  if (!data) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const pdf = await buildOfficialReport(data);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="hisobot_${safeName(data.candidate.fullName)}.pdf"`,
    },
  });
}
