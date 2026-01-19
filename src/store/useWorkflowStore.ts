import { create } from 'zustand';

export type AgentStatus = 'not-started' | 'in-progress' | 'complete';

export interface AgentStep {
    id: string;
    name: string;
    description: string;
    status: AgentStatus;
    // We can allow arbitrary data storage for the agent's "memory"
    data?: Record<string, any>;
}

interface WorkflowState {
    steps: AgentStep[];
    selectedStepId: string | null;
    selectStep: (id: string | null) => void;
    updateStep: (id: string, data: Partial<AgentStep>) => void;
}

const FIXED_AGENTS: AgentStep[] = [
    { id: '1', name: 'Idea Intake Agent', description: 'What is the core insight? Why you? Why now?', status: 'not-started' },
    { id: '2', name: 'Assumption Agent', description: 'What must be true for this to work? Where will it fail?', status: 'not-started' },
    { id: '3', name: 'ICP (Ideal Customer Profile) Agent', description: 'Who is desperate for this? Be specific.', status: 'not-started' },
    { id: '4', name: 'Value Proposition Agent', description: 'Why is your solution 10x better than the status quo?', status: 'not-started' },
    { id: '5', name: 'MVP Scope Agent', description: 'What is the smallest thing you can build to learn?', status: 'not-started' },
    { id: '6', name: 'Success Metrics Agent', description: 'How will you know if it\'s working? One metric that matters.', status: 'not-started' },
    { id: '7', name: 'Roadmap Agent', description: 'What are the first 3 milestones? Kill features, don\'t add them.', status: 'not-started' },
    { id: '8', name: 'Decision & Risk Agent', description: 'Go or No-Go. Are you ready to commit 5 years?', status: 'not-started' },
];

export const useWorkflowStore = create<WorkflowState>((set) => ({
    steps: FIXED_AGENTS,
    selectedStepId: null,
    selectStep: (id) => set({ selectedStepId: id }),
    updateStep: (id, data) => set((state) => ({
        steps: state.steps.map((step) =>
            step.id === id ? { ...step, ...data } : step
        )
    })),
}));
