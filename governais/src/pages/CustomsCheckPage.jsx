import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { checkPromptCustoms } from '../lib/sensitivityClassifier';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useToast } from '../components/Toast';

// ── Category → Badge variant mapping ──────────────────
const CATEGORY_BADGE = {
  'PII': 'blue',
  'Financial': 'rose',
  'Confidential/Internal': 'amber',
  'Credentials': 'rose',
};

// ── Simulated responses generator ────────────────────
function getMockAIResponse(promptText) {
  const lower = promptText.toLowerCase();

  if (lower.includes('summarize') || lower.includes('summary')) {
    return `Based on the text you provided, here is a structured summary of the key discussion points and action items:\n\n• **Core Topic**: Project roadmap alignment and feature prioritization.\n• **Key Takeaways**: The team decided to focus on extending security checks first to meet compliance standards.\n• **Action Items**: Alex to update sensitivity patterns, Priya to review pending tool requests.`;
  }

  if (lower.includes('code') || lower.includes('function') || lower.includes('javascript') || lower.includes('python')) {
    return `Here is a clean implementation matching your request:\n\n\`\`\`javascript\n// Pure helper to scan prompt patterns\nexport function checkCompliance(text, rules) {\n  return rules.filter(rule => {\n    return rule.regex.test(text);\n  });\n}\n\`\`\`\n\nLet me know if you would like me to write unit tests or adjust the structure!`;
  }

  if (lower.includes('draft') || lower.includes('write') || lower.includes('email') || lower.includes('post')) {
    return `Here is a drafted version for you:\n\n"Hi team,\n\nFollowing our review, we have finalized the upcoming feature release notes. Please take a look at the attached roadmap doc and share feedback by EOD tomorrow.\n\nBest regards,\nAlex"`;
  }

  return `I have received and processed your prompt. Please let me know how else I can help you draft code, write emails, or analyze documents today!`;
}

// ── Component ──────────────────────────────────────────

export default function CustomsCheckPage() {
  const { currentUser, tools, addUsageLog, addFlag } = useAppData();
  const { showSuccess } = useToast();

  const [selectedToolId, setSelectedToolId] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'system',
      text: 'Compliance Shield is active. Type a prompt below to interact with the selected AI tool. All prompts are checked prior to dispatch.',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingYellow, setPendingYellow] = useState(null); // { promptText, result }
  const [declared, setDeclared] = useState(false);

  const messagesEndRef = useRef(null);

  const selectedTool = useMemo(
    () => tools.find((t) => t.id === selectedToolId),
    [tools, selectedToolId],
  );

  // Scroll to bottom whenever messages change or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /** Send prompt handler (main chat entry point) */
  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedToolId || pendingYellow || isTyping) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Run customs check
    const checkResult = checkPromptCustoms(textToSend);

    // 1. Add user's message to the chat
    const userMsgId = `msg_user_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: textToSend,
        timestamp: new Date(),
      },
    ]);

    // 2. Handle outcome lanes
    if (checkResult.lane === 'green') {
      // 🟢 GREEN: Log and respond
      const logId = `ul_cc_${Date.now()}`;
      addUsageLog({
        id: logId,
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        employeeName: currentUser.name,
        department: currentUser.department,
        timestamp: new Date(),
        dataTypeShared: 'Prompt (cleared)',
        sensitivityFlagged: false,
        declared: false,
      });

      triggerAIResponse(textToSend);

    } else if (checkResult.lane === 'yellow') {
      // 🟡 YELLOW: Stop and require inline declaration
      setPendingYellow({ promptText: textToSend, result: checkResult });
      setDeclared(false);

      // Append customs intercept warning
      setMessages((prev) => [
        ...prev,
        {
          id: `customs_yellow_${Date.now()}`,
          sender: 'customs_yellow',
          result: checkResult,
          timestamp: new Date(),
        },
      ]);

    } else if (checkResult.lane === 'red') {
      // 🔴 RED: Block immediately, log + flag
      const logId = `ul_cc_${Date.now()}`;
      addUsageLog({
        id: logId,
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        employeeName: currentUser.name,
        department: currentUser.department,
        timestamp: new Date(),
        dataTypeShared: 'Prompt (blocked)',
        sensitivityFlagged: true,
        declared: false,
        matchedTerms: checkResult.matchedTerms,
      });

      addFlag({
        id: `fl_cc_${Date.now()}`,
        usageLogId: logId,
        toolName: selectedTool.name,
        employeeName: currentUser.name,
        department: currentUser.department,
        timestamp: new Date(),
        matchedTerms: checkResult.matchedTerms,
        sensitivityCategory: checkResult.category,
        status: 'open',
        reviewedBy: null,
        reviewNote: null,
        reviewedAt: null,
      });

      // Append red block warning to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `customs_red_${Date.now()}`,
          sender: 'customs_red',
          result: checkResult,
          timestamp: new Date(),
        },
      ]);
    }
  };

  /** Trigger typing delay and mock response */
  const triggerAIResponse = (promptText) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: getMockAIResponse(promptText),
          timestamp: new Date(),
        },
      ]);
    }, 900);
  };

  /** Resolve yellow lane declaration */
  const handleConfirmDeclaration = () => {
    if (!pendingYellow || !declared) return;

    // Log declared usage event
    const logId = `ul_cc_${Date.now()}`;
    addUsageLog({
      id: logId,
      toolId: selectedTool.id,
      toolName: selectedTool.name,
      employeeName: currentUser.name,
      department: currentUser.department,
      timestamp: new Date(),
      dataTypeShared: 'Prompt (declared)',
      sensitivityFlagged: false,
      declared: true,
      matchedTerms: pendingYellow.result.matchedTerms,
    });

    // Replace the customs message with a cleared note, and proceed with AI response
    setMessages((prev) => [
      ...prev.filter((m) => m.sender !== 'customs_yellow'),
      {
        id: `customs_declared_note_${Date.now()}`,
        sender: 'system',
        text: `✓ Declaration approved: Prompt sent to ${selectedTool.name}.`,
        timestamp: new Date(),
      },
    ]);

    showSuccess(`Prompt declared and sent to ${selectedTool.name}`);
    triggerAIResponse(pendingYellow.promptText);
    setPendingYellow(null);
    setDeclared(false);
  };

  /** Cancel/Discard yellow lane prompt */
  const handleCancelDeclaration = () => {
    setMessages((prev) => [
      ...prev.filter((m) => m.sender !== 'customs_yellow'),
      {
        id: `customs_cancel_note_${Date.now()}`,
        sender: 'system',
        text: '✗ Prompt discarded.',
        timestamp: new Date(),
      },
    ]);
    setPendingYellow(null);
    setDeclared(false);
  };

  /** Clear entire conversation */
  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'system',
        text: 'Compliance Shield is active. Type a prompt below to interact with the selected AI tool. All prompts are checked prior to dispatch.',
        timestamp: new Date(),
      },
    ]);
    setPendingYellow(null);
    setDeclared(false);
    setInputText('');
  };

  return (
    <div className="space-y-4 page-enter flex flex-col h-[calc(100vh-130px)]">
      {/* Header card with Tool Selection */}
      <Card className="flex-shrink-0">
        <Card.Body className="py-3 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Prompt Customs Check
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Shield Active
                </span>
              </h1>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Deterministic scanner checks user inputs inline. Green sends; Yellow flags declaration; Red blocks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                id="customs-tool-select"
                className="select-field max-w-xs py-1 px-3 text-[12px]"
                value={selectedToolId}
                onChange={(e) => {
                  setSelectedToolId(e.target.value);
                  handleClearChat();
                }}
              >
                <option value="">Select AI Tool…</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleClearChat}
                className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main chat window container */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-slate-50 border border-slate-200/50 rounded-lg px-4 py-2 max-w-2xl text-center text-[12px] font-medium text-slate-500">
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-ink text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-xl text-[13px] font-medium leading-relaxed shadow-sm">
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.sender === 'ai') {
              return (
                <div key={msg.id} className="flex gap-3 max-w-2xl">
                  {/* AI Avatar */}
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100 shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-[13px] text-slate-700 leading-relaxed shadow-sm whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.sender === 'customs_yellow') {
              return (
                <div key={msg.id} className="flex justify-center customs-result-enter">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-2xl w-full shadow-sm border-l-4 border-l-amber-500">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-amber-900">Declaration Required</h4>
                        <p className="text-[12px] text-amber-700 mt-1">
                          This prompt contains low-severity or internal/confidential keywords. Please provide a validation declaration.
                        </p>
                        <div className="mt-3 bg-white/60 rounded-lg p-2.5 border border-amber-200/50 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Matches:</span>
                          <div className="flex flex-wrap gap-1">
                            {msg.result.matchedTerms.map((term) => (
                              <Badge key={term} variant={CATEGORY_BADGE[msg.result.category] || 'amber'}>
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-3">
                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="checkbox-custom mt-0.5"
                              checked={declared}
                              onChange={(e) => setDeclared(e.target.checked)}
                            />
                            <span className="text-[12px] font-medium text-slate-700 leading-snug select-none">
                              I confirm this content is appropriate to share with{' '}
                              <span className="font-bold text-slate-900">{selectedTool?.name}</span>.
                            </span>
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleConfirmDeclaration}
                              disabled={!declared}
                              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Confirm &amp; Send
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDeclaration}
                              className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.sender === 'customs_red') {
              return (
                <div key={msg.id} className="flex justify-center customs-result-enter">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 max-w-2xl w-full shadow-sm border-l-4 border-l-rose-500">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-rose-900">Blocked — Prompt Not Sent</h4>
                        <p className="text-[12px] text-rose-700 mt-1">
                          This prompt contains high-severity sensitive details ({msg.result.category}) and has been blocked. A compliance flag has been created for review.
                        </p>
                        <div className="mt-3 bg-white/60 rounded-lg p-2.5 border border-rose-200/50 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">Violations:</span>
                          <div className="flex flex-wrap gap-1">
                            {msg.result.matchedTerms.map((term) => (
                              <Badge key={term} variant={CATEGORY_BADGE[msg.result.category] || 'rose'}>
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* AI typing state */}
          {isTyping && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-[13px] text-slate-400 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input panel */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4">
          {!selectedToolId ? (
            <div className="text-center text-[12px] font-medium text-slate-400 py-2">
              Select an AI Tool above to start typing.
            </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <textarea
                className="customs-textarea pr-16"
                rows={1}
                style={{ minHeight: '44px', paddingBottom: '12px' }}
                placeholder={
                  pendingYellow
                    ? 'Please confirm the declaration above before typing next prompt…'
                    : `Send prompt to ${selectedTool?.name}…`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!!pendingYellow || isTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="submit"
                id="check-prompt-btn"
                disabled={!inputText.trim() || !!pendingYellow || isTyping}
                className="absolute right-2 top-1.5 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-ink text-white hover:bg-graphite transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
