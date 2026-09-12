export const USER = {
  name: "Vuk",
  displayName: "Vuk M",
  workspace: "Vuk’s workspace",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=70",
  level: 18,
  xp: 2340,
  xpToNext: 3000,
  streak: 12,
};

export const DASHBOARD_STATS = [
  { label: "Streak", value: "12" },
  { label: "Habits done", value: "1" },
  { label: "Workouts", value: "4" },
  { label: "Pages read", value: "86" },
  { label: "Spent", value: "€312" },
  { label: "XP", value: "2,340" },
];

export const WEEK_ACTIVITY = [1, 3, 5, 2, 4, 6, 2];
export const WEEK_ACTIVITY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MIX_SERIES = [
  { label: "Exercise", color: "#0091ff", values: [0, 2, 4, 1, 3, 5, 1] },
  { label: "Habits", color: "#fde047", values: [1, 1, 2, 1, 2, 2, 1] },
  { label: "Reading", color: "#eab308", values: [0, 1, 1, 2, 1, 2, 0] },
  { label: "Finance", color: "#a16207", values: [0, 1, 0, 1, 0, 2, 1] },
];

export const ACTIVITY_ROWS = [
  {
    time: "Sep 12, 11 AM",
    habit: "—",
    exercise: "—",
    media: "Dune · 20p",
    spend: "—",
    xp: "+20",
  },
  {
    time: "Sep 12, 8 AM",
    habit: "Water",
    exercise: "Chest & Tri",
    media: "—",
    spend: "€14.50",
    xp: "+115",
  },
  {
    time: "Sep 11, 9 PM",
    habit: "Journal",
    exercise: "—",
    media: "One Piece · 3ep",
    spend: "—",
    xp: "+15",
  },
  {
    time: "Sep 11, 7 AM",
    habit: "Walk",
    exercise: "Back & Bi",
    media: "—",
    spend: "€9.99",
    xp: "+80",
  },
  {
    time: "Sep 10, 8 PM",
    habit: "Read",
    exercise: "—",
    media: "Dune · 25p",
    spend: "€64.00",
    xp: "+20",
  },
  {
    time: "Sep 10, 7 AM",
    habit: "Water",
    exercise: "Push day",
    media: "—",
    spend: "—",
    xp: "+80",
  },
];

export const TODAY_TASKS = [
  { id: "1", title: "Gym — Chest & Triceps", done: true, xp: 20, tag: "Exercise" },
  { id: "2", title: "Read 20 pages", done: false, xp: 20, tag: "Reading" },
  { id: "3", title: "Log today's expenses", done: false, xp: 15, tag: "Finance" },
  { id: "4", title: "Drink 3L of water", done: false, xp: 10, tag: "Health" },
];

export const GOAL_MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export const GOALS = [
  {
    id: "1",
    title: "Read 12 books",
    current: 7,
    target: 12,
    unit: "books",
    pct: 58,
    color: "#0091ff",
    category: "Reading",
    deadline: "Dec 31",
    note: "Dune is the current title — 240 of 688 pages.",
    series: [1, 2, 3, 4, 5, 6, 7],
    milestones: [
      { label: "First 4 books", done: true },
      { label: "Halfway · 6 books", done: true },
      { label: "Finish Dune", done: false },
      { label: "Hit 12 by December", done: false },
    ],
  },
  {
    id: "2",
    title: "Save €2,000",
    current: 920,
    target: 2000,
    unit: "€",
    pct: 46,
    color: "#34d56b",
    category: "Finance",
    deadline: "Dec 31",
    note: "Dining is the leak — 22% above last week.",
    series: [120, 280, 410, 540, 690, 810, 920],
    milestones: [
      { label: "Open the pot", done: true },
      { label: "€1,000 parked", done: false },
      { label: "€2,000 target", done: false },
    ],
  },
  {
    id: "3",
    title: "Workout 3× / week",
    current: 2,
    target: 3,
    unit: "sessions",
    pct: 67,
    color: "#eab308",
    category: "Training",
    deadline: "This week",
    note: "Back & biceps landed. One session left.",
    series: [1, 2, 2, 3, 2, 3, 2],
    milestones: [
      { label: "Two sessions", done: true },
      { label: "Third session", done: false },
      { label: "Four-week streak", done: false },
    ],
  },
];

export const ACHIEVEMENTS = [
  {
    id: "first-workout",
    title: "First workout",
    desc: "Logged your first session.",
    category: "Training",
    unlocked: true,
    date: "Mar 2",
    xp: 50,
    progress: 100,
  },
  {
    id: "streak-7",
    title: "7-day streak",
    desc: "Stayed on the system seven days in a row.",
    category: "Streaks",
    unlocked: true,
    date: "Apr 18",
    xp: 80,
    progress: 100,
  },
  {
    id: "volume-king",
    title: "Volume king",
    desc: "Hit 6,000 kg in one session.",
    category: "Training",
    unlocked: true,
    date: "Sep 10",
    xp: 120,
    progress: 100,
  },
  {
    id: "bookworm",
    title: "Bookworm",
    desc: "Finish 12 books this year.",
    category: "Reading",
    unlocked: false,
    date: null,
    xp: 200,
    progress: 58,
  },
  {
    id: "saver",
    title: "Quiet money",
    desc: "Park €2,000 in the savings pot.",
    category: "Finance",
    unlocked: false,
    date: null,
    xp: 150,
    progress: 46,
  },
  {
    id: "streak-30",
    title: "30-day streak",
    desc: "Keep the discipline streak for a month.",
    category: "Streaks",
    unlocked: false,
    date: null,
    xp: 250,
    progress: 40,
  },
  {
    id: "pages-500",
    title: "500 pages",
    desc: "Read 500 pages in a single month.",
    category: "Reading",
    unlocked: false,
    date: null,
    xp: 90,
    progress: 72,
  },
  {
    id: "pr-club",
    title: "PR club",
    desc: "Hit 3 personal records in one week.",
    category: "Training",
    unlocked: true,
    date: "Sep 12",
    xp: 100,
    progress: 100,
  },
];

export const RECENT_ACTIVITY = [
  { id: "1", title: "Watched 3 episodes", meta: "Yesterday", xp: 15 },
  { id: "2", title: "Completed Chest & Biceps", meta: "Yesterday", xp: 80 },
  { id: "3", title: "Read 25 pages · Dune", meta: "Yesterday", xp: 20 },
];

/** Intensities 0–4. Default 5 weeks for the monthly grid. */
export function buildHeatmap(seed = 18, count = 35): number[] {
  const days: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807) % 2147483647;
    const v = s % 10;
    days.push(v < 1 ? 0 : v < 3 ? 1 : v < 6 ? 2 : v < 8 ? 3 : 4);
  }
  return days;
}

export const WORKOUT_SUMMARY = {
  name: "Back & Biceps",
  volumeKg: 6420,
  volumeDelta: 8,
  sets: 14,
  setsDelta: 0,
  durationMin: 48,
  durationDelta: -5,
  prs: 3,
  muscles: [
    { name: "Lats", pct: 34 },
    { name: "Rhomboids", pct: 22 },
    { name: "Biceps", pct: 28 },
    { name: "Rear Delts", pct: 16 },
  ],
  exercises: [
    { name: "Lat Pulldown", detail: "80kg × 10, 10, 8" },
    { name: "Barbell Row", detail: "70kg × 8, 8, 7" },
    { name: "Hammer Curl", detail: "18kg × 12, 12, 10" },
  ],
};

export const CHEST_EXERCISES = {
  primary: ["Barbell Bench Press", "Incline Dumbbell Press"],
  secondary: ["Dumbbell Fly", "Cable Crossover", "Push-ups"],
  swaps: [
    { name: "Machine Chest Press", match: 88 },
    { name: "Dumbbell Bench Press", match: 92 },
    { name: "Smith Machine Bench", match: 81 },
  ],
};

export const FINANCE_TABS = [
  "Overview",
  "Transactions",
  "Budgets",
  "Categories",
  "Import",
] as const;

export const SPEND_CATEGORIES = [
  { label: "Food", amount: 420, pct: 17, color: "#8b5cf6" },
  { label: "Transport", amount: 210, pct: 9, color: "#38bdf8" },
  { label: "Shopping", amount: 380, pct: 16, color: "#3b82f6" },
  { label: "Entertainment", amount: 145, pct: 6, color: "#22d3ee" },
  { label: "Bills", amount: 584, pct: 24, color: "#f43f5e" },
  { label: "Health", amount: 195, pct: 8, color: "#60a5fa" },
  { label: "Other", amount: 497, pct: 20, color: "#6b7280" },
];

export const FINANCE_STATS = {
  total: 2431,
  delta: 16,
  highlight: [
    { label: "Food & Dining", amount: 420, pct: 17, color: "#f43f5e" },
    { label: "Shopping", amount: 380, pct: 16, color: "#f43f5e" },
    { label: "Entertainment", amount: 145, pct: 6, color: "#f43f5e" },
    { label: "Transport", amount: 210, pct: 9, color: "#3b82f6" },
  ],
};

export const TRANSACTIONS = [
  {
    id: "1",
    merchant: "McDonald’s",
    category: "Food & Dining",
    amount: -14.5,
    date: "Sep 11, 2026",
    mark: "M",
    markColor: "#ef4444",
  },
  {
    id: "2",
    merchant: "Merkur",
    category: "Groceries",
    amount: -32.2,
    date: "Sep 10, 2026",
    mark: "M",
    markColor: "#f43f5e",
  },
  {
    id: "3",
    merchant: "NIS",
    category: "Transport",
    amount: -60,
    date: "Sep 10, 2026",
    mark: "N",
    markColor: "#6366f1",
  },
  {
    id: "4",
    merchant: "Steam",
    category: "Entertainment",
    amount: -24.99,
    date: "Sep 9, 2026",
    mark: "S",
    markColor: "#2563eb",
  },
  {
    id: "5",
    merchant: "Konzum",
    category: "Food & Dining",
    amount: -14.5,
    date: "Sep 8, 2026",
    mark: "K",
    markColor: "#16a34a",
  },
  {
    id: "6",
    merchant: "Spotify",
    category: "Entertainment",
    amount: -9.99,
    date: "Sep 7, 2026",
    mark: "S",
    markColor: "#22c55e",
  },
  {
    id: "7",
    merchant: "Zara",
    category: "Shopping",
    amount: -64,
    date: "Sep 5, 2026",
    mark: "Z",
    markColor: "#111110",
  },
  {
    id: "8",
    merchant: "Salary",
    category: "Income",
    amount: 2100,
    date: "Sep 1, 2026",
    mark: "€",
    markColor: "#10a142",
  },
];

export const BUDGETS = [
  { category: "Food & Dining", spent: 420, limit: 600, pct: 70, color: "#34d56b" },
  { category: "Entertainment", spent: 145, limit: 200, pct: 72, color: "#22d3ee" },
  { category: "Shopping", spent: 380, limit: 400, pct: 96, color: "#f43f5e" },
  { category: "Transport", spent: 210, limit: 250, pct: 84, color: "#eab308" },
];

export const MEDIA = {
  watching: {
    title: "One Piece",
    progress: 1123,
    max: null as number | null,
    kind: "anime" as const,
  },
  reading: {
    title: "Dune",
    progress: 240,
    max: 688,
    kind: "book" as const,
  },
  recent: [
    { title: "Interstellar", rating: 5, kind: "movie" as const },
    { title: "Blade Runner 2049", rating: 5, kind: "movie" as const },
    { title: "Attack on Titan", rating: 4, kind: "anime" as const },
    { title: "Atomic Habits", rating: 4, kind: "book" as const },
  ],
};

export const WEEK_DAYS = [
  { label: "Sun", date: 9 },
  { label: "Mon", date: 10 },
  { label: "Tue", date: 11 },
  { label: "Wed", date: 12 },
];

export const WEEK_HOURS = ["7 am", "8 am", "9 am"];

export const WEEK_EVENTS = [
  { day: 0, row: 0, title: "Gym", time: "7:00", tone: "gold" as const },
  { day: 1, row: 1, title: "Read Dune", time: "8:00", tone: "purple" as const },
  { day: 3, row: 1, title: "Expenses", time: "8:30", tone: "pink" as const },
];

export const SPOTLIGHT = [
  { title: "Back & Biceps", meta: "Yesterday · 48 min", href: "/exercise" },
  { title: "Dune", meta: "Page 240 / 688", href: "/entertainment" },
  { title: "One Piece", meta: "Episode 1123", href: "/entertainment" },
];

export const JOURNAL = [
  {
    id: "1",
    title: "Great session today",
    date: "Sat, Sep 12",
    tags: ["#progress", "#gym"],
    excerpt: "Hit three PRs on back day. Energy was high after a solid sleep.",
    body: "Hit three PRs on back day. Energy was high after a solid sleep. Lat pulldown felt locked in — kept rest short and focused on form. Evening: 25 pages of Dune.",
  },
  {
    id: "2",
    title: "Quiet morning",
    date: "Fri, Sep 11",
    tags: ["#mindset"],
    excerpt: "Slower start. Kept the habit streak alive with a short walk.",
    body: "Slower start. Kept the habit streak alive with a short walk and a simple breakfast log.",
  },
  {
    id: "3",
    title: "Reading on the train",
    date: "Thu, Sep 10",
    tags: ["#reading"],
    excerpt: "Forty pages of Dune before the city even started.",
    body: "Forty pages of Dune before the city even started. The train was quiet enough to stay in the chapter. Logged it as soon as I sat down at the desk.",
  },
];

export const TIMELINE = [
  {
    id: "t1",
    day: "Sat, Sep 12",
    time: "11:42",
    kind: "ENTERTAINMENT",
    title: "Read 20 pages · Dune",
    meta: "+20 XP",
    category: "entertainment",
    detail: "Page 240 / 688. Morning train chapter held.",
  },
  {
    id: "t2",
    day: "Sat, Sep 12",
    time: "10:13",
    kind: "EXPENSE",
    title: "Lunch · €14.50",
    meta: "Food",
    category: "finance",
    detail: "McDonald’s. Dining is 22% above last week.",
  },
  {
    id: "t3",
    day: "Sat, Sep 12",
    time: "08:15",
    kind: "WORKOUT",
    title: "Chest & Triceps",
    meta: "+115 XP",
    category: "exercise",
    detail: "Water habit + session. Volume trending up.",
  },
  {
    id: "t4",
    day: "Fri, Sep 11",
    time: "21:04",
    kind: "ENTERTAINMENT",
    title: "One Piece · 3 episodes",
    meta: "+15 XP",
    category: "entertainment",
    detail: "Caught up to episode 1123.",
  },
  {
    id: "t5",
    day: "Fri, Sep 11",
    time: "19:40",
    kind: "HABIT",
    title: "Journal",
    meta: "+15 XP",
    category: "habits",
    detail: "Quiet morning recap. Streak kept alive.",
  },
  {
    id: "t6",
    day: "Fri, Sep 11",
    time: "07:20",
    kind: "WORKOUT",
    title: "Back & Biceps",
    meta: "+80 XP",
    category: "exercise",
    detail: "3 PRs. Lat pulldown and barbell row led.",
  },
  {
    id: "t7",
    day: "Fri, Sep 11",
    time: "07:10",
    kind: "EXPENSE",
    title: "Coffee · €9.99",
    meta: "Food",
    category: "finance",
    detail: "Logged before the session.",
  },
  {
    id: "t8",
    day: "Thu, Sep 10",
    time: "20:12",
    kind: "ENTERTAINMENT",
    title: "Read 25 pages · Dune",
    meta: "+20 XP",
    category: "entertainment",
    detail: "Evening pages after dinner.",
  },
  {
    id: "t9",
    day: "Thu, Sep 10",
    time: "19:30",
    kind: "EXPENSE",
    title: "Groceries · €64.00",
    meta: "Food",
    category: "finance",
    detail: "Weekly shop. Still inside the food budget.",
  },
  {
    id: "t10",
    day: "Thu, Sep 10",
    time: "07:05",
    kind: "WORKOUT",
    title: "Push day",
    meta: "+80 XP",
    category: "exercise",
    detail: "Water + push. Sets stayed honest.",
  },
  {
    id: "t11",
    day: "Thu, Sep 10",
    time: "07:00",
    kind: "HABIT",
    title: "Morning water",
    meta: "+10 XP",
    category: "habits",
    detail: "First check of the day.",
  },
];

export const WEEKLY_RECAP = {
  workouts: 4,
  prs: 3,
  booksPages: 86,
  spent: 312,
  insight:
    "You trained 4/4 planned days, increased volume by 8%, and hit 3 PRs. Reading is on pace; dining spend is 22% above last week.",
};
