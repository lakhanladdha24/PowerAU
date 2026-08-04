import { HelpCircle, Database, Activity, Sliders, BarChart3, FileText, Check } from 'lucide-react';

export default function VisualPipeline({ currentStage, onStageSelect, unlockedStages }) {
  const steps = [
    {
      id: 'ask',
      label: '1. Ask',
      icon: <HelpCircle size={18} />,
      desc: 'Formulate your business problem and analytical objectives.'
    },
    {
      id: 'collect',
      label: '2. Collect',
      icon: <Database size={18} />,
      desc: 'Connect database, APIs, or upload local data assets.'
    },
    {
      id: 'investigate',
      label: '3. Investigate',
      icon: <Activity size={18} />,
      desc: 'Auto-profile data quality, distributions, and anomalies.'
    },
    {
      id: 'prepare',
      label: '4. Prepare',
      icon: <Sliders size={18} />,
      desc: 'Clean, filter, and apply self-healing pipelines.'
    },
    {
      id: 'analyze',
      label: '5. Analyze',
      icon: <BarChart3 size={18} />,
      desc: 'Run predictive models, segmentations, and conversational analysis.'
    },
    {
      id: 'present',
      label: '6. Present',
      icon: <FileText size={18} />,
      desc: 'Generate executive summaries, client slides, and reports.'
    }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStage);

  const getConnectorWidth = () => {
    if (currentIndex <= 0) return '0%';
    return `${(currentIndex / (steps.length - 1)) * 100}%`;
  };

  return (
    <div className="pipeline-track glass-panel" style={{ padding: '16px 32px', marginBottom: '8px' }}>
      {/* 1. Connector Line */}
      <div className="pipeline-connector" style={{ left: '8%', right: '8%' }}>
        <div 
          className="pipeline-connector-progress" 
          style={{ width: getConnectorWidth(), background: 'var(--primary-gradient)' }}
        />
      </div>

      {/* 2. Nodes */}
      {steps.map((step, idx) => {
        const isUnlocked = unlockedStages.includes(step.id);
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        
        let statusClass = '';
        if (isActive) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';
        else if (!isUnlocked) statusClass = 'locked';

        const cursorStyle = isUnlocked ? 'pointer' : 'not-allowed';
        const opacityStyle = isUnlocked ? 1 : 0.4;

        return (
          <div 
            key={step.id} 
            className={`pipeline-node ${statusClass}`}
            onClick={() => isUnlocked && onStageSelect(step.id)}
            style={{ 
              cursor: cursorStyle, 
              opacity: opacityStyle, 
              transition: 'all 0.2s ease',
              zIndex: 3
            }}
          >
            <div 
              className="pipeline-node-icon"
              title={step.desc}
              style={{
                background: isActive 
                  ? 'var(--primary-gradient)' 
                  : isCompleted 
                    ? 'rgba(16,185,129,0.15)' 
                    : 'var(--bg-surface-elevated)',
                border: isActive 
                  ? '2px solid var(--accent-cyan)' 
                  : isCompleted 
                    ? '2px solid var(--accent-emerald)' 
                    : '2px solid var(--border-color)',
                color: isActive || isCompleted ? '#fff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 0 12px rgba(6,182,212,0.4)' : 'none'
              }}
            >
              {isCompleted ? <Check size={16} color="var(--accent-emerald)" /> : step.icon}
            </div>
            <div className="pipeline-node-label" style={{ textAlign: 'center', marginTop: '6px' }}>
              <div style={{ 
                fontWeight: isActive ? '700' : '500', 
                color: isActive ? '#fff' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.8rem'
              }}>
                {step.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
