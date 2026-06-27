import { prisma } from "@/lib/prisma";
import ExamRunner from "./exam-runner";

export const dynamic = "force-dynamic";

export default async function ExamPage({ params }: { params: { examId: string } }) {
  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: { bank: { select: { skill: true, name: true, _count: { select: { questions: true } } } } },
  });

  if (!exam) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-sm">
          <h1 className="text-xl font-bold text-red-600">Imtihon topilmadi</h1>
          <p className="text-slate-500 mt-2">Havola noto'g'ri yoki imtihon o'chirilgan.</p>
        </div>
      </main>
    );
  }

  const enough = exam.bank._count.questions >= exam.numQuestions;
  const direction = exam.bank.skill || exam.bank.name;

  return (
    <ExamRunner
      examId={exam.id}
      examName={exam.name}
      numQuestions={exam.numQuestions}
      durationMin={exam.durationMin}
      direction={direction}
      ready={enough}
    />
  );
}
