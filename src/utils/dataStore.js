import { useState, useEffect } from 'react';

class DataStore {
  constructor() {
    this.state = {
      activeBranch: 'main',
      branches: {
        main: {
          datasetName: '',
          rawContent: '',
          headers: [],
          rows: [],
          originalRows: [],
          schema: {},
          context: 'general',
          anomalies: [],
          columnMetrics: {},
          globalQualityScore: 0,
          originalQualityScore: 0,
          changesLog: [],
          duplicateCount: 0,
        }
      },
      commitHistory: [],
    };
    this.listeners = new Set();
  }

  getState() {
    return {
      activeBranch: this.state.activeBranch,
      branchesList: Object.keys(this.state.branches),
      commitHistory: this.state.commitHistory,
      ...this.state.branches[this.state.activeBranch]
    };
  }

  setState(updates) {
    const active = this.state.activeBranch;
    const currentBranchState = this.state.branches[active];
    
    // Split updates into global store variables and active branch variables
    const globalKeys = ['activeBranch', 'commitHistory', 'branches'];
    const branchUpdates = {};
    const storeUpdates = {};

    Object.keys(updates).forEach(key => {
      if (globalKeys.includes(key)) {
        storeUpdates[key] = updates[key];
      } else {
        branchUpdates[key] = updates[key];
      }
    });

    this.state = {
      ...this.state,
      ...storeUpdates,
      branches: {
        ...this.state.branches,
        [active]: {
          ...currentBranchState,
          ...branchUpdates
        }
      }
    };

    const nextState = this.getState();
    this.listeners.forEach(listener => listener(nextState));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Git-for-Data functions
  commit(message, author = 'AI Data Engineer') {
    const active = this.state.activeBranch;
    const currentBranchState = this.state.branches[active];
    
    const newCommit = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      message,
      timestamp: new Date().toISOString(),
      branch: active,
      author,
      // Deep snapshot
      state: JSON.parse(JSON.stringify(currentBranchState))
    };

    this.setState({
      commitHistory: [newCommit, ...this.state.commitHistory]
    });
    return newCommit;
  }

  createBranch(branchName) {
    const cleanName = branchName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!cleanName) return;
    if (this.state.branches[cleanName]) {
      throw new Error(`Branch '${cleanName}' already exists.`);
    }
    const activeState = this.state.branches[this.state.activeBranch];
    
    this.state.branches[cleanName] = JSON.parse(JSON.stringify(activeState));
    this.setState({
      activeBranch: cleanName
    });
  }

  checkoutBranch(branchName) {
    if (!this.state.branches[branchName]) {
      throw new Error(`Branch '${branchName}' does not exist.`);
    }
    this.setState({
      activeBranch: branchName
    });
  }

  rollbackToCommit(commitId) {
    const commit = this.state.commitHistory.find(c => c.id === commitId);
    if (!commit) {
      throw new Error(`Commit '${commitId}' not found.`);
    }
    this.setState({
      ...commit.state
    });
  }
}

export const store = new DataStore();

// React Hook to consume store
export function useDataStore() {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    return store.subscribe(newState => {
      setState(newState);
    });
  }, []);

  const updateState = (updates) => {
    store.setState(updates);
  };

  const commit = (message, author) => {
    return store.commit(message, author);
  };

  const createBranch = (name) => {
    store.createBranch(name);
  };

  const checkoutBranch = (name) => {
    store.checkoutBranch(name);
  };

  const rollback = (commitId) => {
    store.rollbackToCommit(commitId);
  };

  return {
    ...state,
    updateState,
    commit,
    createBranch,
    checkoutBranch,
    rollback
  };
}
