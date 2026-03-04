const SCHOOL_COLORS: Record<string, string> = {
  Washington: "#4B2E83", "Texas Tech": "#CC0000", "Texas A&M": "#500000",
  Miami: "#F47321", Nebraska: "#E41C38", Indiana: "#990000", Kansas: "#0051BA",
  Louisville: "#AD0000", "Nc State": "#CC0000", "Mississippi State": "#660000",
  "Arizona State": "#8C1D40", Grambling: "#FDB913", "Georiga Tech": "#B3A369",
  "Richmond University": "#990000", "University of South Florida": "#006747",
  "Southern Mississippi University": "#FFB81C", "Loyola Marymount University": "#00205B",
  "UNC Asheville": "#003366", "Prairie View A & M University": "#4F2D7F",
  "Middle Tennessee State University": "#0066CC", "Seattle University": "#AA0000",
  "University of Miami": "#F47321", "Kennesaw State University": "#FDBB30",
  "High Point University": "#330072", "St Bonaventure University": "#6E3219",
  "Florida International University": "#002F56", "Indiana University": "#990000",
  "University of Louisville": "#AD0000", "North Carolina State University": "#CC0000",
  "University of Deleware": "#00539F", "Jackson State University": "#002147",
};

const ABBREVS: Record<string, string> = {
  Washington: "UW", "Texas Tech": "TTU", "Texas A&M": "TAMU",
  Miami: "MIA", Nebraska: "NEB", Indiana: "IU", Kansas: "KU",
  Louisville: "UL", "Nc State": "NCS", "Mississippi State": "MSU",
  "Arizona State": "ASU", Grambling: "GRM", "Georiga Tech": "GT",
  "Richmond University": "RU", "University of South Florida": "USF",
  "Southern Mississippi University": "USM", "Loyola Marymount University": "LMU",
  "UNC Asheville": "UNCA", "Prairie View A & M University": "PVA",
  "Middle Tennessee State University": "MTSU", "Seattle University": "SU",
  "University of Miami": "MIA", "Kennesaw State University": "KSU",
  "High Point University": "HPU", "St Bonaventure University": "SBU",
  "Florida International University": "FIU", "Indiana University": "IU",
  "University of Louisville": "UL", "North Carolina State University": "NCS",
  "University of Deleware": "DEL", "Jackson State University": "JSU",
};

export function SchoolBadge({ school, size = 28 }: { school: string; size?: number }) {
  const color = SCHOOL_COLORS[school] || "#555";
  const isDark = ["#B3A369", "#FDB913", "#FFB81C", "#FDBB30"].includes(color);
  return (
    <div
      style={{ width: size, height: size, background: color }}
      className="rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/10"
    >
      <span
        style={{ fontSize: size * 0.35, color: isDark ? "#000" : "#fff" }}
        className="font-black tracking-tight"
      >
        {ABBREVS[school] || "??"}
      </span>
    </div>
  );
}
