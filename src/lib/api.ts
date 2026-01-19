const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// --- Types ---

export interface AIResponse {
    summary: string;
    key_points: string[];
    recommendations: string[];
    risks: string[];
    next_steps: string[];
}

export interface IdeaIntakePayload {
    problem: string;
    why_exists: string;
    why_now: string;
}

export interface AssumptionPayload {
    problem: string;
    true_factors: string;
    failure_points: string;
}

export interface IcpPayload {
    customer_identity: string;
    urgency: string;
    alternatives: string;
}

export interface ValuePropPayload {
    differentiation: string;
    pain_removed: string;
}

export interface MvpScopePayload {
    problem: string;
    target_user: string;
    value_proposition: string;
}

export interface SuccessMetricsPayload {
    metric: string;
    measurement: string;
    timeframe: string;
}

export interface RoadmapPayload {
    milestones: string;
    not_building: string;
}

export interface DecisionRiskPayload {
    decisions: string;
    risks: string;
    open_questions: string;
    full_context?: any;
}

// --- Helper ---

async function post<T>(endpoint: string, payload: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorInfo;
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            errorInfo = json.error || json.message || "API request failed";
        } catch {
            // If response is not JSON (e.g. HTML 404/500), use the raw text (truncated if too long)
            const preview = text.slice(0, 200);
            errorInfo = `Server Error (${response.status}): ${preview}`;
        }
        throw new Error(errorInfo);
    }
    return response.json();
}

// --- API Methods ---

export const api = {
    ideaIntake: (payload: IdeaIntakePayload) => post<AIResponse>("idea-intake", payload),
    assumptions: (payload: AssumptionPayload) => post<AIResponse>("assumptions", payload),
    icp: (payload: IcpPayload) => post<AIResponse>("icp", payload),
    valueProposition: (payload: ValuePropPayload) => post<AIResponse>("value-proposition", payload),

    // Alias to match the specifically requested function name in previous turn, keeping it for compatibility
    mvpScope: (payload: MvpScopePayload) => post<AIResponse>("mvp-scope", payload),

    successMetrics: (payload: SuccessMetricsPayload) => post<AIResponse>("success-metrics", payload),
    roadmap: (payload: RoadmapPayload) => post<AIResponse>("roadmap", payload),
    decisionRisk: (payload: DecisionRiskPayload) => post<AIResponse>("decision-risk", payload),
};

// Re-export specific standalone function if needed by existing code
export const callMvpScopeAgent = api.mvpScope;
export type MvpScopeResponse = AIResponse;
