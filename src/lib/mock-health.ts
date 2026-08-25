// Mock data for the HealthHub/NUHS sync and message-doctor demos. Client-side only — never touches the DB.

export type MockAppointment = {
  id: string;
  offsetDays: number; // relative to today so the demo always shows upcoming dates
  time: string;
  clinic: string;
  doctor: string;
  purpose: string;
  location: string;
};

export const MOCK_APPOINTMENTS: MockAppointment[] = [
  {
    id: "apt-1",
    offsetDays: 3,
    time: "10:30am",
    clinic: "NCIS Oncology Clinic",
    doctor: "Dr. Tan Wei Ming",
    purpose: "Oncology review + blood test",
    location: "NUH Medical Centre, Level 8",
  },
  {
    id: "apt-2",
    offsetDays: 8,
    time: "9:00am",
    clinic: "NUH Imaging Centre",
    doctor: "Radiology",
    purpose: "PET-CT scan (fasting from midnight)",
    location: "NUH Main Building, Basement 1",
  },
  {
    id: "apt-3",
    offsetDays: 12,
    time: "2:15pm",
    clinic: "Pioneer Polyclinic",
    doctor: "Pharmacy",
    purpose: "Chronic medication refill",
    location: "Pioneer Polyclinic, Level 1",
  },
  {
    id: "apt-4",
    offsetDays: 19,
    time: "11:00am",
    clinic: "NCIS Oncology Clinic",
    doctor: "Dr. Tan Wei Ming",
    purpose: "Treatment planning discussion",
    location: "NUH Medical Centre, Level 8",
  },
];

export const appointmentDate = (a: MockAppointment): Date => {
  const d = new Date();
  d.setDate(d.getDate() + a.offsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const MOCK_CARE_TEAM = {
  doctor: "Dr. Tan Wei Ming",
  role: "Senior Consultant, Medical Oncology",
  clinic: "NCIS · National University Hospital",
};

export const MESSAGE_SUBJECTS = [
  "Prescription refill",
  "New symptom to report",
  "Change an appointment",
  "Question about medication",
  "Something else",
] as const;

export type DoctorMessage = {
  id: string;
  subject: string;
  body: string;
  sentAt: string; // ISO
};

// Typed localStorage helpers (mock state is per-device by design).
export const MOCK_KEYS = {
  healthhub: "alongside.mock.healthhub",
  doctorMessages: "alongside.mock.doctorMessages",
  instagram: "alongside.mock.instagram",
} as const;

export function readMockFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
export function writeMockFlag(key: string, value: boolean) {
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}
export function readMockJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeMockJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}
