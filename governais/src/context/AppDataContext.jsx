import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  mockUsers,
  mockTools,
  mockRequests,
  mockUsageLogs,
  mockFlags,
  MOCK_EMPLOYEES,
  DATA_TYPE_OPTIONS,
  demoSnippets,
} from '../data/mockData';
import { classifyContent } from '../lib/sensitivityClassifier';

const AppDataContext = createContext(null);

/**
 * Central data provider — all app state lives here (in-memory only).
 * Provides currentUser, tools, requests, usageLogs, flags, and mutation functions.
 */
export function AppDataProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]); // defaults to Alex
  const [tools, setTools] = useState(mockTools);
  const [requests, setRequests] = useState(mockRequests);
  const [usageLogs, setUsageLogs] = useState(mockUsageLogs);
  const [flags, setFlags] = useState(mockFlags);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);

  /** Append a single usage log entry to the front of the list. */
  const addUsageLog = useCallback((entry) => {
    setUsageLogs((prev) => [entry, ...prev]);
  }, []);

  /** Append a single flag entry to the front of the list. */
  const addFlag = useCallback((flag) => {
    setFlags((prev) => [flag, ...prev]);
  }, []);

  /**
   * Resolve a flag — updates status, reviewer, and note.
   * @param {string} id — Flag ID
   * @param {'reviewed_safe' | 'reviewed_violation'} resolution
   * @param {string} reviewNote — Optional note from the reviewer
   */
  const resolveFlag = useCallback(
    (id, resolution, reviewNote = '') => {
      setFlags((prev) =>
        prev.map((flag) =>
          flag.id === id
            ? {
                ...flag,
                status: resolution,
                reviewedBy: currentUser.name,
                reviewNote: reviewNote || null,
                reviewedAt: new Date(),
              }
            : flag,
        ),
      );
    },
    [currentUser.name],
  );

  /**
   * Simulate a random usage event for demo purposes.
   * Picks a random approved tool, random employee/department,
   * current timestamp, random data type, and a random content snippet.
   * Runs the sensitivity classifier on the snippet — if flagged,
   * auto-creates a corresponding flag with status "open".
   */
  const simulateUsageEvent = useCallback(() => {
    const tool = tools[Math.floor(Math.random() * tools.length)];
    const employee = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)];
    const dataType = DATA_TYPE_OPTIONS[Math.floor(Math.random() * DATA_TYPE_OPTIONS.length)];
    const snippet = demoSnippets[currentSnippetIndex];
    
    setCurrentSnippetIndex((prev) => (prev + 1) % demoSnippets.length);

    // Run classifier on the snippet
    const classification = classifyContent(snippet);

    const entry = {
      id: `ul_sim_${Date.now()}`,
      toolId: tool.id,
      toolName: tool.name,
      employeeName: employee.name,
      department: employee.department,
      timestamp: new Date(),
      dataTypeShared: dataType,
      sensitivityFlagged: classification.flagged,
    };

    addUsageLog(entry);

    // Auto-create a flag if the classifier detected sensitive content
    if (classification.flagged) {
      const newFlag = {
        id: `fl_sim_${Date.now()}`,
        usageLogId: entry.id,
        toolName: tool.name,
        employeeName: employee.name,
        department: employee.department,
        timestamp: new Date(),
        matchedTerms: classification.matchedTerms,
        sensitivityCategory: classification.category,
        status: 'open',
        reviewedBy: null,
        reviewNote: null,
        reviewedAt: null,
      };
      addFlag(newFlag);
    }

    return entry;
  }, [tools, addUsageLog, addFlag, currentSnippetIndex]);

  /** Submit a new tool request as the current user. */
  const addToolRequest = useCallback(
    (data) => {
      const newRequest = {
        id: `r${Date.now()}`,
        toolName: data.toolName,
        vendor: data.vendor,
        purpose: data.purpose,
        dataTypesInvolved: data.dataTypesInvolved,
        requestedBy: currentUser.name,
        department: data.department,
        status: 'pending',
        submittedAt: new Date(),
        reviewedBy: null,
        reviewNote: null,
        reviewedAt: null,
      };
      setRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    },
    [currentUser.name],
  );

  /**
   * Approve a pending request:
   * - Updates request status, reviewer info
   * - Auto-creates a tool entry in the approved list
   * - Risk: "high" if data types include customer/financial data, else "medium"
   */
  const approveRequest = useCallback(
    (id, reviewNote = '') => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: 'approved',
                reviewedBy: currentUser.name,
                reviewNote: reviewNote || null,
                reviewedAt: new Date(),
              }
            : req,
        ),
      );

      // Find the request to create a corresponding tool
      setRequests((prev) => {
        const approved = prev.find((r) => r.id === id);
        if (approved) {
          const sensitiveTypes = ['Customer data', 'Financial data'];
          const hasSensitive = approved.dataTypesInvolved.some((dt) =>
            sensitiveTypes.includes(dt),
          );

          const newTool = {
            id: `t${Date.now()}`,
            name: approved.toolName,
            vendor: approved.vendor,
            category: 'Productivity', // default category for newly approved tools
            approvedFor: [approved.department],
            approvedAt: new Date(),
            riskLevel: hasSensitive ? 'high' : 'medium',
          };

          setTools((prevTools) => [...prevTools, newTool]);
        }
        return prev;
      });
    },
    [currentUser.name],
  );

  /** Reject a pending request — does NOT add to tools list. */
  const rejectRequest = useCallback(
    (id, reviewNote = '') => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: 'rejected',
                reviewedBy: currentUser.name,
                reviewNote: reviewNote || null,
                reviewedAt: new Date(),
              }
            : req,
        ),
      );
    },
    [currentUser.name],
  );

  const resetDemoData = useCallback(() => {
    setCurrentUser(mockUsers[0]);
    setTools(mockTools);
    setRequests(mockRequests);
    setUsageLogs(mockUsageLogs);
    setFlags(mockFlags);
    setCurrentSnippetIndex(0);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      tools,
      requests,
      usageLogs,
      flags,
      currentSnippetIndex,
      totalSnippets: demoSnippets.length,
      resetDemoData,
      addToolRequest,
      addUsageLog,
      addFlag,
      simulateUsageEvent,
      approveRequest,
      rejectRequest,
      resolveFlag,
    }),
    [currentUser, tools, requests, usageLogs, flags, currentSnippetIndex, resetDemoData, addToolRequest, addUsageLog, addFlag, simulateUsageEvent, approveRequest, rejectRequest, resolveFlag],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return ctx;
}

export { mockUsers };
