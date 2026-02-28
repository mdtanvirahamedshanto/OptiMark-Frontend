"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import OMRSheet, {
  OMRColor,
  HeaderSize,
  InfoType,
} from "@/components/omr/OMRSheet";
import NormalOMRSheet from "@/components/omr/NormalOMRSheet";
import { useAuth } from "@/components/ui/AuthContext";

const questionCountOptions = [40, 60, 80, 100] as const;
const colorOptions: { label: string; value: OMRColor; hex: string }[] = [
  { label: "Red", value: "red", hex: "#ef4444" },
  { label: "Gray", value: "gray", hex: "#6b7280" },
  { label: "Blue", value: "blue", hex: "#3b82f6" },
  { label: "Green", value: "green", hex: "#22c55e" },
  { label: "Purple", value: "purple", hex: "#a855f7" },
  { label: "Orange", value: "orange", hex: "#f97316" },
  { label: "Cyan", value: "cyan", hex: "#06b6d4" },
  { label: "Pink", value: "pink", hex: "#ec4899" },
  { label: "Yellow", value: "yellow", hex: "#eab308" },
  { label: "Lime", value: "lime", hex: "#84cc16" },
];

function OMRGeneratorContent() {
  const { institutionName: authInstitution, address: authAddress } = useAuth();
  const searchParams = useSearchParams();

  // Branding (read from context, fallback if missing)
  const institutionName = authInstitution || "Md Tanvir Ahamed Shanto";
  const address = authAddress || "কলাপাড়া, পটুয়াখালী";

  const [titleSize, setTitleSize] = useState(24);
  const [addressSize, setAddressSize] = useState(14);

  // Template selection
  const [templateType, setTemplateType] = useState<"board" | "normal">(
    "normal",
  );
  const [examId, setExamId] = useState<string | null>(null);

  // Advanced (board) state
  const [questionCount, setQuestionCount] = useState<40 | 60 | 80 | 100>(100);
  const [color, setColor] = useState<OMRColor>("red");
  const [headerSize, setHeaderSize] = useState<HeaderSize>("Small");
  const [infoType, setInfoType] = useState<InfoType>("Digital");

  // Normal state
  const [normalQuestionCount, setNormalQuestionCount] = useState<string>("30");
  const [normalColumns, setNormalColumns] = useState<2 | 3 | 4>(2);
  const [normalPages, setNormalPages] = useState<1 | 2>(2);

  // Read query params on mount
  useEffect(() => {
    const qCount = searchParams.get("qCount");
    if (qCount) {
      const parsed = parseInt(qCount, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        setQuestionCount(
          (parsed > 80 ? 100 : parsed > 60 ? 80 : parsed > 40 ? 60 : 40) as any,
        );
        setNormalQuestionCount(String(parsed));
      }
    }
    const typeParam = searchParams.get("type");
    if (typeParam === "board" || typeParam === "normal") {
      setTemplateType(typeParam);
    }
    const eid = searchParams.get("examId");
    if (eid) setExamId(eid);
  }, [searchParams]);

  const handleDownloadPdf = useCallback(() => {
    try {
      const originalTitle = document.title;
      document.title = `OMR_${templateType}_${Date.now()}.pdf`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } catch (e) {
      console.error("PDF Generation Error:", e);
    }
  }, [templateType]);

  // Validation for normal question count
  const parseNormalQuestionCount = (val: string | number) => {
    let v = Number(val);
    if (isNaN(v)) return 30;
    if (v < 10) return 10;
    if (v > 100) return 100;
    return v;
  };

  return (
    <div className="flex gap-6 max-w-[100vw] mx-auto h-[calc(100vh-6rem)] overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden print:block print:max-w-none print:mx-0 print:p-0 print:absolute print:inset-0 print:bg-white">
      {/* Controls Panel */}
      <div className="print:hidden w-[340px] shrink-0 h-full overflow-y-auto pb-8 scrollbar-hide">
        <div className="bg-white border rounded">
          {/* Header & Download */}
          <div className="bg-gray-100 p-4 border-b">
            {examId && (
              <a
                href={`/dashboard/exams/${examId}`}
                className="block text-center text-sm text-blue-600 hover:underline mb-2"
              >
                ← পরীক্ষায় ফিরে যান
              </a>
            )}
            <h3 className="text-center text-gray-800 font-semibold mb-3">
              সেটিংস
            </h3>
            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              ডাউনলোড
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Branding Section */}
            <section className="space-y-4">
              <h3 className="text-[13px] font-medium text-gray-500">
                ব্র্যান্ডিং
              </h3>

              <div>
                <input
                  type="text"
                  value={institutionName}
                  readOnly
                  className="w-full px-3 py-2 border rounded text-[15px] bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                  title="Institution name is locked to your profile. You can only adjust the size."
                />
                <div className="flex justify-between items-center gap-3 mt-2 text-sm text-gray-700">
                  <span>Size</span>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={titleSize}
                    onChange={(e) => setTitleSize(Number(e.target.value))}
                    className="flex-1 accent-blue-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-5 text-right font-medium">
                    {titleSize}
                  </span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="w-full px-3 py-2 border rounded text-[15px] bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                  title="Address is locked to your profile. You can only adjust the size."
                />
                <div className="flex justify-between items-center gap-3 mt-2 text-sm text-gray-700">
                  <span>Size</span>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={addressSize}
                    onChange={(e) => setAddressSize(Number(e.target.value))}
                    className="flex-1 accent-blue-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-5 text-right font-medium">
                    {addressSize}
                  </span>
                </div>
              </div>
            </section>

            {/* Template Selection */}
            <section className="space-y-3">
              <h3 className="text-[13px] font-medium text-gray-800 border-t pt-4">
                টেমপ্লেট নির্বাচন করুন
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTemplateType("board")}
                  className={`flex flex-col items-center border rounded-md transition-all overflow-hidden ${templateType === "board" ? "ring-2 ring-gray-400 border-transparent shadow" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="h-[120px] w-full bg-gray-50 flex flex-col pt-1 items-center justify-start border-b px-2 gap-1 text-[8px] text-gray-300 pointer-events-none">
                    <div className="w-full flex justify-between px-1">
                      <div className="w-2 h-2 bg-black"></div>
                      <div className="w-2 h-2 bg-black"></div>
                    </div>
                    <div className="w-20 h-2 bg-gray-200 mt-1"></div>
                    <div className="w-16 h-1.5 bg-gray-100"></div>
                    <div className="w-full flex justify-around mt-1">
                      <div className="h-14 w-8 border border-red-200 bg-white"></div>
                      <div className="h-14 w-8 border border-red-200 bg-white"></div>
                    </div>
                    <div className="w-full flex justify-around mt-1 space-x-0.5">
                      <div className="h-4 w-6 border border-red-200 bg-white"></div>
                      <div className="h-4 w-6 border border-red-200 bg-white"></div>
                      <div className="h-4 w-6 border border-red-200 bg-white"></div>
                      <div className="h-4 w-6 border border-red-200 bg-white"></div>
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-gray-700 w-full py-2 bg-white text-center">
                    বোর্ড
                  </span>
                </button>
                <button
                  onClick={() => setTemplateType("normal")}
                  className={`flex flex-col items-center border rounded-md transition-all overflow-hidden ${templateType === "normal" ? "ring-2 ring-gray-400 border-transparent shadow" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="h-[120px] w-full bg-gray-50 flex flex-col pt-2 items-center justify-start border-b px-2 gap-1 text-[8px] text-gray-300 pointer-events-none">
                    <div className="flex w-full items-center mb-1">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-16 h-1.5 bg-gray-300"></div>
                        <div className="w-10 h-1 bg-gray-200 mt-1"></div>
                      </div>
                    </div>
                    <div className="w-full h-8 border border-gray-200 mb-1 flex items-center px-1">
                      <div className="w-14 h-1 bg-gray-200"></div>
                    </div>
                    <div className="w-full flex justify-around mb-1">
                      <div className="w-3 h-1 bg-black"></div>
                      <div className="w-3 h-1 bg-black"></div>
                      <div className="w-3 h-1 bg-black"></div>
                    </div>
                    <div className="flex gap-1 w-full justify-center">
                      <div className="h-6 w-8 border border-gray-200"></div>
                      <div className="h-6 w-8 border border-gray-200"></div>
                      <div className="h-6 w-8 border border-gray-200"></div>
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-gray-700 w-full py-2 bg-white text-center">
                    সাধারণ
                  </span>
                </button>
              </div>
            </section>

            {/* Specific Template Controls */}
            {templateType === "normal" && (
              <section className="space-y-4 pt-1">
                <h3 className="text-[16px] font-bold text-gray-800">
                  সাধারণ কাস্টমাইজ অপশনস
                </h3>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={normalQuestionCount}
                    onChange={(e) => setNormalQuestionCount(e.target.value)}
                    onBlur={(e) =>
                      setNormalQuestionCount(
                        String(parseNormalQuestionCount(e.target.value)),
                      )
                    }
                    className="w-[100px] px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
                    Columns
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((col) => (
                      <button
                        key={`col-${col}`}
                        onClick={() => setNormalColumns(col as 2 | 3 | 4)}
                        disabled={normalPages === 2 && col !== 3}
                        className={`flex items-center justify-center py-2 px-1 border rounded transition-all ${
                          normalColumns === col
                            ? "border-blue-500 bg-blue-50/50 shadow-sm"
                            : normalPages === 2 && col !== 3
                              ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex gap-1.5">
                          {Array.from({ length: col }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-[18px] ${
                                normalColumns === col
                                  ? "bg-blue-400"
                                  : normalPages === 2 && col !== 3
                                    ? "bg-gray-200"
                                    : "bg-gray-300"
                              } rounded-sm`}
                            ></div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                  {normalPages === 2 && (
                    <p className="text-[11px] text-red-500 mt-1.5">
                      ২ টি শিটের জন্য শুধুমাত্র ৩ টি কলাম ব্যবহার করা যাবে।
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-1.5">
                    Pages per Sheet
                  </label>
                  <div className="flex gap-2">
                    {[1, 2].map((pages) => (
                      <button
                        key={`pages-${pages}`}
                        onClick={() => {
                          setNormalPages(pages as 1 | 2);
                          if (pages === 2) setNormalColumns(3);
                        }}
                        className={`flex-1 py-1.5 rounded font-medium text-[13px] transition ${
                          normalPages === pages
                            ? "bg-[#f43f5e] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pages} {pages === 1 ? "PAGE" : "PAGES"}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {templateType === "board" && (
              <section className="space-y-5 pt-1">
                <h3 className="text-[16px] font-bold text-gray-800">
                  বোর্ড কাস্টমাইজ অপশনস
                </h3>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2 mt-2">
                    থিম নির্বাচন করুন
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {colorOptions.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={`w-9 h-9 rounded shadow-sm hover:scale-105 transition-all ${color === c.value ? "ring-[3px] ring-offset-2 ring-gray-400" : ""}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2">
                    হেডার নির্বাচন করুন
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHeaderSize("Small")}
                      className={`flex-1 py-1.5 rounded font-medium text-[13px] transition ${headerSize === "Small" ? "bg-[#f43f5e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      SMALL
                    </button>
                    <button
                      onClick={() => setHeaderSize("Big")}
                      className={`flex-1 py-1.5 rounded font-medium text-[13px] transition ${headerSize === "Big" ? "bg-[#f43f5e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      BIG
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2">
                    পরীক্ষার্থী ও পরীক্ষার তথ্যের টাইপ
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInfoType("Digital")}
                      className={`flex-1 py-1.5 rounded font-medium text-[13px] transition ${infoType === "Digital" ? "bg-[#f43f5e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      DIGITAL
                    </button>
                    <button
                      onClick={() => setInfoType("Manual")}
                      className={`flex-1 py-1.5 rounded font-medium text-[13px] transition ${infoType === "Manual" ? "bg-[#f43f5e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      MANUAL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2">
                    প্রশ্ন সংখ্যা
                  </label>
                  <div className="flex gap-2">
                    {[40, 60, 80, 100].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuestionCount(num as any)}
                        className={`flex-1 py-1.5 rounded font-medium text-[13px] transition ${questionCount === num ? "bg-[#f43f5e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* OMR Sheet Preview Workspace */}
      <div className="flex-1 bg-white border rounded shadow-inner overflow-auto relative print:border-none print:shadow-none print:overflow-hidden print:absolute print:top-0 print:left-0 print:m-0 print:p-0">
        <div className="absolute min-w-full min-h-full flex items-center justify-center p-8 bg-[#eef2f6] print:static print:min-w-0 print:min-h-0 print:w-[210mm] print:h-[297mm] print:p-0 print:m-0 print:bg-white print:flex">
          <div className="my-4 shadow-lg print:shadow-none print:m-0 print:w-[210mm] print:h-[297mm] print:p-0">
            <div
              className="origin-top print:origin-top-left flex justify-center print:flex print:w-[210mm] print:h-[297mm] print:overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                width: "100%",
                height: "100%",
              }}
            >
              {templateType === "board" ? (
                <OMRSheet
                  institutionName={institutionName}
                  address={address}
                  questionCount={questionCount}
                  color={color}
                  headerSize={headerSize}
                  infoType={infoType}
                  titleSize={titleSize}
                  addressSize={addressSize}
                />
              ) : normalPages === 1 ? (
                <div className="flex w-full justify-center items-start print:w-full print:max-w-[210mm] print:gap-0 break-inside-avoid">
                  <div className="w-full flex justify-center">
                    <NormalOMRSheet
                      institutionName={institutionName}
                      address={address}
                      questionCount={Number(normalQuestionCount) || 30}
                      columnsCount={normalColumns}
                      titleSize={titleSize}
                      addressSize={addressSize}
                      layout="single"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full justify-center items-center gap-6 print:gap-4 print:w-[210mm] break-inside-avoid">
                  <div className="w-full flex justify-center border-b border-dashed border-gray-300 print:border-none pb-6 print:pb-0">
                    <NormalOMRSheet
                      institutionName={institutionName}
                      address={address}
                      questionCount={Math.min(
                        Number(normalQuestionCount) || 30,
                        30,
                      )}
                      columnsCount={3}
                      titleSize={titleSize}
                      addressSize={addressSize}
                      layout="double"
                    />
                  </div>
                  <div className="w-full flex justify-center hidden md:flex print:flex pt-2 print:pt-0">
                    <NormalOMRSheet
                      institutionName={institutionName}
                      address={address}
                      questionCount={Math.min(
                        Number(normalQuestionCount) || 30,
                        30,
                      )}
                      columnsCount={3}
                      titleSize={titleSize}
                      addressSize={addressSize}
                      layout="double"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OMRGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]"></div>
        </div>
      }
    >
      <OMRGeneratorContent />
    </Suspense>
  );
}
