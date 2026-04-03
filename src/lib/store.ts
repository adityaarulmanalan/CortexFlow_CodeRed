export type Role = "manager" | "employee";
export type TaskStatus = "Pending" | "In Progress" | "Done";
export type RiskLevel = "Low" | "Medium" | "High";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: TaskStatus;
  assignedDate: string;
  sourceMeeting: string;
}

export interface Decision {
  id: string;
  context: string;
  outcome: string;
  date: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  type: Role;
}

export interface TeamRisk {
  memberId: string;
  riskLevel: RiskLevel;
  dependentTasks: number;
  missingKnowledge: string[];
  handoverSummary: string;
}

// Keys for persistence
const STORAGE_KEYS = {
  TASKS: 'cortex_tasks',
  TEAM: 'cortex_team',
  DECISIONS: 'cortex_decisions'
};

// Initial Mock Data
const initialTasks: Task[] = [
  { id: "t1", title: "Finalize Q3 Marketing Budget", owner: "Sarah Jenkins", deadline: "2026-04-15", status: "In Progress", assignedDate: "2026-04-02", sourceMeeting: "Q3 Growth Sync" },
  { id: "t2", title: "Setup AWS RDS instance", owner: "Alex Chen", deadline: "2026-04-05", status: "Pending", assignedDate: "2026-04-01", sourceMeeting: "Architecture Review" },
  { id: "t3", title: "Review vendor contracts", owner: "Michael Wood", deadline: "2026-04-15", status: "Done", assignedDate: "2026-03-30", sourceMeeting: "Legal Compliance" },
  { id: "t4", title: "Optimize Neural Vector Engine", owner: "Sarah Jenkins", deadline: "2026-04-20", status: "Pending", assignedDate: "2026-04-03", sourceMeeting: "Engine Optimization" },
];

const initialDecisions: Decision[] = [
  { id: "d1", context: "Choosing the cloud provider for the new platform", outcome: "Selected AWS over GCP due to existing credits.", date: "2026-03-15" },
  { id: "d2", context: "Frontend framework selection", outcome: "React/Next.js selected for developer velocity.", date: "2026-03-20" },
];

const initialTeam: TeamMember[] = [
  { id: "m1", name: "Sarah Jenkins", role: "Marketing Lead", email: "sarah@cortex.ai", type: "employee" },
  { id: "m2", name: "Alex Chen", role: "DevOps Engineer", email: "alex@cortex.ai", type: "employee" },
  { id: "m3", name: "Michael Wood", role: "Legal Counsel", email: "michael@cortex.ai", type: "employee" },
  { id: "m4", name: "Admin Manager", role: "System Administrator", email: "admin@cortex.ai", type: "manager" },
];

// Helper to load from storage safely
const load = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

// Internal mutable states
let tasks: Task[] = load(STORAGE_KEYS.TASKS, initialTasks);
let decisions: Decision[] = load(STORAGE_KEYS.DECISIONS, initialDecisions);
let team: TeamMember[] = load(STORAGE_KEYS.TEAM, initialTeam);

// Helper to save to storage safely
const save = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
};

export const store = {
  getTasks: () => [...tasks],
  addTask: (task: Task) => { 
    tasks.push(task); 
    save();
  },
  updateTaskStatus: (id: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = status;
      save();
    }
  },
  deleteTask: (id: string) => {
    tasks = tasks.filter(t => t.id !== id);
    save();
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
      save();
    }
  },
  
  getDecisions: () => [...decisions],
  addDecision: (decision: Decision) => { 
    decisions.push(decision); 
    save();
  },
  
  getTeam: () => [...team],
  findMemberByEmail: (email: string) => team.find(m => m.email.toLowerCase() === email.toLowerCase()),
  addTeamMember: (member: TeamMember) => { 
    if (!team.find(m => m.email === member.email)) {
      team.push(member); 
      // Auto-assign a welcome task so the UI isn't empty
      tasks.push({
        id: `t-init-${member.id}`,
        title: `Complete System Initialization for ${member.role}`,
        owner: member.name,
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        status: "Pending",
        assignedDate: new Date().toISOString().split('T')[0],
        sourceMeeting: "System Onboarding"
      });
      save();
    }
  },
  removeTeamMember: (id: string) => {
    const member = team.find(m => m.id === id);
    if (member) {
      team = team.filter(m => m.id !== id);
      tasks = tasks.filter(t => t.owner !== member.name);
      save();
    }
  },

  // Meeting transcripts
  getMeetings: (): {id: string; title: string; date: string; transcript: string; summary: string}[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('cortex_meetings');
    return saved ? JSON.parse(saved) : [];
  },
  addMeeting: (meeting: {id: string; title: string; date: string; transcript: string; summary: string}) => {
    if (typeof window === 'undefined') return;
    const meetings = store.getMeetings();
    meetings.push(meeting);
    localStorage.setItem('cortex_meetings', JSON.stringify(meetings));
  },
};
