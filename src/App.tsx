import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import bankData from './data/questions.json';
import { filterQuestions, limitQuestions } from './lib/questions';
import { buildOptionOrder, shuffle } from './lib/shuffle';
import { applyResult, dateKey } from './lib/stats';
import { applyTheme, loadState, saveState } from './lib/storage';
import { Dashboard } from './pages/Dashboard';
import { Practice } from './pages/Practice';
import { Settings } from './pages/Settings';
import { Stats } from './pages/Stats';
import { WrongBook } from './pages/WrongBook';
import type { Bank, Session, SessionConfig, Theme, View } from './types';

const bank = bankData as unknown as Bank;

function sanitizeSession(session: Session | null): Session | null {
  if (!session) return null;

  const knownIds = new Set(bank.questions.map((question) => question.id));
  const queue = session.queue.filter((id) => knownIds.has(id));
  if (queue.length === 0) return null;

  const keepKnown = <T,>(entries: Record<string, T>) =>
    Object.fromEntries(
      Object.entries(entries).filter(([id]) => knownIds.has(id)),
    );

  return {
    ...session,
    queue,
    index: Math.min(session.index, queue.length),
    results: keepKnown(session.results),
    selections: keepKnown(session.selections),
    optionOrders: keepKnown(session.optionOrders),
  };
}

export default function App() {
  const [initial] = useState(() => {
    const stored = loadState();
    return { ...stored, lastSession: sanitizeSession(stored.lastSession) };
  });
  const [stats, setStats] = useState(initial.stats);
  const [activity, setActivity] = useState(initial.activity);
  const [settings, setSettings] = useState(initial.settings);
  const [session, setSession] = useState<Session | null>(initial.lastSession);
  const [view, setView] = useState<View>(() => {
    const active =
      initial.lastSession !== null &&
      initial.lastSession.index < initial.lastSession.queue.length;
    return active ? 'practice' : 'dashboard';
  });

  useEffect(() => {
    saveState({
      version: 1,
      stats,
      activity,
      lastSession: session,
      settings,
    });
  }, [stats, activity, session, settings]);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, session?.index]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [settings.theme]);

  function startSession(config: SessionConfig) {
    const pool = filterQuestions(bank.questions, config, stats);
    const ordered = config.mode === 'sequential' ? pool : shuffle(pool);
    const selected = limitQuestions(ordered, config.count);
    if (selected.length === 0) {
      // e.g. 錯題本已全部複習完，再練一次時沒有符合條件的題目
      setView('dashboard');
      return;
    }

    setSession({
      ...config,
      queue: selected.map((question) => question.id),
      index: 0,
      results: {},
      selections: {},
      optionOrders: Object.fromEntries(
        selected.map((question) => [
          question.id,
          buildOptionOrder(question, config.mode !== 'sequential'),
        ]),
      ),
    });
    setView('practice');
  }

  function submitAnswer(questionId: string, selected: string[]) {
    const question = bank.questions.find((item) => item.id === questionId);
    if (!question) return;

    const ok = selected.length === 1 && selected[0] === question.answer[0];

    setSession((previous) =>
      previous
        ? {
            ...previous,
            results: { ...previous.results, [questionId]: ok },
            selections: { ...previous.selections, [questionId]: selected },
          }
        : previous,
    );
    setStats((previous) => ({
      ...previous,
      [questionId]: applyResult(previous[questionId], ok),
    }));

    const today = dateKey();
    setActivity((previous) => ({
      ...previous,
      [today]: (previous[today] ?? 0) + 1,
    }));
  }

  function goNext() {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            index: Math.min(previous.index + 1, previous.queue.length),
          }
        : previous,
    );
  }

  function goTo(index: number) {
    setSession((previous) =>
      previous
        ? {
            ...previous,
            index: Math.max(0, Math.min(index, previous.queue.length)),
          }
        : previous,
    );
  }

  function restartSession() {
    if (!session) return;
    startSession({
      mode: session.mode,
      chapters: session.chapters,
      count: session.count,
      unattemptedOnly: session.unattemptedOnly,
    });
  }

  function resetProgress() {
    if (
      !window.confirm(
        '確定要清除所有作答紀錄、錯題本與續練進度嗎？題庫內容不會受影響。',
      )
    ) {
      return;
    }
    setStats({});
    setActivity({});
    setSession(null);
    setView('dashboard');
  }

  function navigate(next: View) {
    if (next === 'practice' && !session) return;
    setView(next);
  }

  function changeTheme(theme: Theme) {
    setSettings((previous) => ({ ...previous, theme }));
  }

  function changeAutoNext(autoNext: boolean) {
    setSettings((previous) => ({ ...previous, autoNext }));
  }

  const practicing = view === 'practice' && session !== null;

  return (
    <div className="min-h-dvh">
      <Header
        view={view}
        theme={settings.theme}
        practicing={practicing}
        onNavigate={navigate}
        onThemeChange={changeTheme}
      />

      <div key={view} className="animate-fade-in">
        {practicing ? (
          <Practice
            session={session}
            bank={bank}
            autoNext={settings.autoNext}
            onAnswer={submitAnswer}
            onNext={goNext}
            onGoTo={goTo}
            onExit={() => setView('dashboard')}
            onRestart={restartSession}
            onWrongBook={() => setView('wrong')}
          />
        ) : view === 'wrong' ? (
          <WrongBook bank={bank} stats={stats} onStart={startSession} />
        ) : view === 'stats' ? (
          <Stats bank={bank} stats={stats} activity={activity} />
        ) : view === 'settings' ? (
          <Settings
            bank={bank}
            settings={settings}
            onThemeChange={changeTheme}
            onAutoNextChange={changeAutoNext}
            onReset={resetProgress}
          />
        ) : (
          <Dashboard
            bank={bank}
            stats={stats}
            activity={activity}
            session={session}
            onStart={startSession}
            onResume={() => setView('practice')}
            onNavigate={navigate}
          />
        )}
      </div>
    </div>
  );
}
