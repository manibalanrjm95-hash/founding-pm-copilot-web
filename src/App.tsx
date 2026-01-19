import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WorkflowCanvas } from './components/workflow/WorkflowCanvas';
import { ConfigPanel } from './components/config/ConfigPanel';

import { useWorkflowStore } from './store/useWorkflowStore';

function App() {
    const { selectedStepId } = useWorkflowStore();

    return (
        <AppLayout
            sidebar={<Sidebar />}
            header={<Header />}
            main={<WorkflowCanvas />}
            configPanel={selectedStepId ? <ConfigPanel /> : null}
        />
    );
}

export default App;
