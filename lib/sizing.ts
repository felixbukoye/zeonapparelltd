/* ZEON size knowledge base — preset chart XS–6XL, helper, manual fields. */

export interface SizeRow {
  size: string;
  chest: string;
  waist: string;
  hip: string;
  height: string;
}

export const SIZE_CHART: SizeRow[] = [
  { size: "XS", chest: "80–84", waist: "62–66", hip: "86–90", height: "155–162" },
  { size: "S", chest: "86–90", waist: "68–72", hip: "92–96", height: "160–168" },
  { size: "M", chest: "92–97", waist: "74–79", hip: "98–103", height: "166–174" },
  { size: "L", chest: "99–104", waist: "81–86", hip: "105–110", height: "172–180" },
  { size: "XL", chest: "106–112", waist: "88–94", hip: "112–118", height: "178–184" },
  { size: "2XL", chest: "114–121", waist: "96–103", hip: "120–127", height: "182–188" },
  { size: "3XL", chest: "122–129", waist: "104–111", hip: "128–135", height: "184–190" },
  { size: "4XL", chest: "130–137", waist: "112–119", hip: "136–143", height: "186–192" },
  { size: "5XL", chest: "138–145", waist: "120–127", hip: "144–151", height: "188–194" },
  { size: "6XL", chest: "146–153", waist: "128–135", hip: "152–159", height: "190–196" },
];

export const MEASUREMENT_FIELDS: {
  id: string;
  label: string;
  unit: string;
  howTo: string;
}[] = [
  {
    id: "chest",
    label: "Chest / Bust",
    unit: "cm",
    howTo:
      "Wrap the tape around the fullest part of your chest, keeping it level across your back. Breathe normally — don't pull tight.",
  },
  {
    id: "waist",
    label: "Waist",
    unit: "cm",
    howTo:
      "Measure around your natural waistline (usually just above the navel). Leave one finger of ease under the tape.",
  },
  {
    id: "hip",
    label: "Hips",
    unit: "cm",
    howTo:
      "Stand with feet together and measure around the fullest part of your hips and bottom.",
  },
  {
    id: "topLength",
    label: "Top length",
    unit: "cm",
    howTo:
      "From the highest point of your shoulder (beside your neck) straight down to where you'd like the top to end.",
  },
  {
    id: "sleeve",
    label: "Sleeve",
    unit: "cm",
    howTo:
      "With your arm slightly bent, measure from your shoulder tip down to your wrist bone.",
  },
  {
    id: "trouserWaist",
    label: "Trouser waist",
    unit: "cm",
    howTo:
      "Measure where you like your trousers to sit — usually at or just below the navel. Keep one finger of ease.",
  },
  {
    id: "inseam",
    label: "Inseam",
    unit: "cm",
    howTo:
      "From the inside of your thigh at the crotch straight down to your ankle bone. Ask a friend to help for accuracy.",
  },
];

/* "Not sure? Help me choose" — shirt size + height + build → suggestion. */

const SHIRT_TO_INDEX: Record<string, number> = {
  XS: 0,
  S: 1,
  M: 2,
  L: 3,
  XL: 4,
  "2XL": 5,
  "3XL": 6,
  "4XL": 7,
};

export function suggestSize(input: {
  shirtSize?: string;
  height?: string;
  build?: string;
}): string | null {
  if (!input.shirtSize || !(input.shirtSize in SHIRT_TO_INDEX)) return null;
  let idx = SHIRT_TO_INDEX[input.shirtSize];
  if (input.build === "broad") idx += 1;
  if (input.build === "slim") idx -= 1;
  if (input.height === "tall") idx += 1;
  if (input.height === "petite") idx -= 1;
  idx = Math.max(0, Math.min(SIZE_CHART.length - 1, idx));
  return SIZE_CHART[idx].size;
}

/* ------------------------------ intake options ----------------------------- */

export const CAREER_STAGES = [
  { id: "student", label: "Student", hint: "Studying now — welcome aboard" },
  { id: "nysc", label: "NYSC", hint: "Serving our nation" },
  { id: "staff", label: "Staff", hint: "Practising professional" },
  { id: "senior", label: "Senior / Consultant", hint: "Leader & mentor" },
] as const;

export const CAREER_STAGE_COPY: Record<string, string> = {
  student: "Student-friendly pricing applied — plus our Study → Staff bundle suggestion.",
  nysc: "NYSC pricing applied — congratulations on your service year.",
  staff: "Professional pricing applied.",
  senior: "Senior pricing applied — thank you for leading the profession.",
};

export const AGE_BANDS = ["18–24", "25–34", "35–44", "45–54", "55+"];

export const CONHESS_LEVELS = [
  "CONHESS 1–5",
  "CONHESS 6–9",
  "CONHESS 10–13",
  "CONHESS 14–15",
  "Not applicable (student / NYSC)",
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const DEPARTMENTS = [
  "Accident & Emergency",
  "Surgery / Theatre",
  "Internal Medicine",
  "Paediatrics",
  "Obstetrics & Gynaecology",
  "ICU / HDU",
  "Outpatient (GOPD/SOPD)",
  "Laboratory",
  "Pharmacy",
  "Radiology",
  "Nursing / Ward",
  "Administration",
  "Other",
];

export const APPROVED_COLOUR_LIBRARY = [
  "Ceil Blue",
  "Navy",
  "Teal",
  "Hunter Green",
  "Wine",
  "Black",
  "White",
];
