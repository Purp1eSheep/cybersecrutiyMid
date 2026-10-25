import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  IconArrowLeft,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconListOrdered,
  IconX,
} from '../components/Icons';
import { formatSource, indexQuestions, MODE_LABEL } from '../lib/questions';
import { percent } from '../lib/stats';
import type { Bank, Session } from '../types';

interface PracticeProps {
  session: Session;
  bank: Bank;
  autoNext: boolean;
  onAnswer: (questionId: string, selected: string[]) => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onExit: () => void;
  onRestart: () => void;
  onWrongBook: () => void;
}

export function Practice({
  session,
  bank,
  autoNext,
  onAnswer,
  onNext,
  onGoTo,
  onExit,
  onRestart,
  onWrongBook,
}: PracticeProps) {
  const questionMap = useMemo(
    () => indexQuestions(bank.questions),
    [bank.questions],
  );
  const total = session.queue.length;
  const finished = session.index >= total;
  const currentId = finished ? undefined : session.queue[session.index];
  const question = currentId ? questionMap.get(currentId) : undefined;
  const revealed = currentId ? currentId in session.results : false;
  const currentResult = currentId ? session.results[currentId] : undefined;

  const [picked, setPicked] = useState<string[]>([]);
  const [lastOptionClick, setLastOptionClick] = useState<{
    key: string;
    time: number;
    questionId: string;
  } | null>(null);
  const [justAnsweredId, setJustAnsweredId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [navHeight, setNavHeight] = useState<number>();
  const questionCardRef = useRef<HTMLElement>(null);

  const submitAnswer = (id: string, selected: string[]) => {
    setJustAnsweredId(id);
    onAnswer(id, selected);
  };

  const handleOptionClick = (key: string) => {
    const now = Date.now();
    if (
      !revealed &&
      lastOptionClick !== null &&
      lastOptionClick.questionId === question?.id &&
      lastOptionClick.key === key &&
      now - lastOptionClick.time <= 500
    ) {
      submitAnswer(question!.id, [key]);
      setLastOptionClick(null);
      return;
    }

    setPicked([key]);
    setLastOptionClick({ key, time: now, questionId: question!.id });
  };

  useEffect(() => {
    setPicked(currentId ? (session.selections[currentId] ?? []) : []);
  }, [currentId, session.selections]);

  // 讓桌機版題目導覽的高度與主答題卡片一致，內容過多時在卡片內捲動。
  useLayoutEffect(() => {
    const card = questionCardRef.current;
    if (!card) return;

    const syncHeight = () => {
      setNavHeight(card.getBoundingClientRect().height);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(card);
    return () => observer.disconnect();
  }, [question?.id]);

  useEffect(() => {
    setJustAnsweredId(null);
  }, [currentId]);

  const displayKeys = useMemo(() => {
    if (!question) return [];
    if (question.type === 'tf') return ['T', 'F'];
    return (
      session.optionOrders[question.id] ??
      (question.options ?? []).map((option) => option.key)
    );
  }, [question, session.optionOrders]);

  const answered = Object.keys(session.results).length;
  const correct = Object.values(session.results).filter(Boolean).length;

  const goPrev = () => {
    if (session.index > 0) onGoTo(session.index - 1);
  };
  const goNext = () => {
    if (session.index < total) onNext();
  };

  const selectQuestion = (index: number) => {
    onGoTo(index);
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      setNavOpen(false);
    }
  };

  useEffect(() => {
    if (!navOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navOpen]);

  useEffect(() => {
    if (
      !autoNext ||
      !question ||
      justAnsweredId !== question.id ||
      !revealed ||
      currentResult !== true
    ) {
      return;
    }

    const timer = window.setTimeout(goNext, 1000);
    return () => window.clearTimeout(timer);
  }, [
    autoNext,
    session.index,
    question,
    justAnsweredId,
    revealed,
    currentResult,
  ]);

  useEffect(() => {
    if (finished || !question) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (!revealed) {
        const optionNumber = Number(event.key);
        if (
          Number.isInteger(optionNumber) &&
          optionNumber >= 1 &&
          optionNumber <= displayKeys.length
        ) {
          event.preventDefault();
          setPicked([displayKeys[optionNumber - 1]]);
          return;
        }
        if (event.key === 'Enter' && picked.length > 0) {
          event.preventDefault();
          submitAnswer(question.id, picked);
          return;
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (finished) {
    return (
      <SessionSummary
        session={session}
        answered={answered}
        correct={correct}
        onExit={onExit}
        onRestart={onRestart}
        onWrongBook={onWrongBook}
      />
    );
  }

  if (!question) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="card p-6 text-center">
          <p className="font-semibold">找不到這一題</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            題庫可能已經更新，請回儀表板重新開始。
          </p>
          <button type="button" onClick={onExit} className="btn-primary mt-5">
            回儀表板
          </button>
        </div>
      </main>
    );
  }

  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  const optionStateClass = (isAnswer: boolean, isPicked: boolean): string => {
    if (revealed) {
      if (isAnswer) return 'border-emerald-500/70 bg-emerald-500/10';
      if (isPicked) return 'border-rose-500/70 bg-rose-500/10';
      return 'border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900';
    }
    if (isPicked) {
      return 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/20';
    }
    return 'border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/60 dark:hover:bg-cyan-500/5';
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl px-4 pb-14 pt-5">
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={onExit} className="btn-ghost">
              <IconArrowLeft className="h-4 w-4" />
              結束
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {MODE_LABEL[session.mode]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  第 {session.index + 1} / {total} 題
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNavOpen((open) => !open)}
                aria-expanded={navOpen}
                className="btn-ghost px-3 py-2"
              >
                <IconListOrdered className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {navOpen ? '收起導覽' : '題目導覽'}
                </span>
                <span className="sm:hidden">導覽</span>
              </button>
            </div>
          </div>

          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="animate-shimmer h-full rounded-full bg-cyan-500 bg-[linear-gradient(110deg,#06b6d4_20%,#22d3ee_40%,#06b6d4_60%)] bg-[length:200%_100%] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <article
            key={question.id}
            ref={questionCardRef}
            className="animate-rise-in card mt-5 p-5 sm:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">
                {question.chapter?.trim() || '未分類'}
              </span>
              <span className="chip">
                {question.type === 'tf' ? '是非題' : '單選題'}
              </span>
              {question.source && (
                <span
                  className="chip border-cyan-200 bg-cyan-50/70 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300"
                  title={question.source}
                >
                  {formatSource(question.source)}
                </span>
              )}
            </div>

            <h2 className="mt-4 whitespace-pre-wrap text-lg font-semibold leading-relaxed sm:text-xl">
              {question.question}
            </h2>

            {question.code && (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-[13px] leading-relaxed text-slate-200 ring-1 ring-slate-800">
                <code className="font-mono">{question.code}</code>
              </pre>
            )}

            <div className="mt-6">
              {question.type === 'tf' ? (
                <div className="grid grid-cols-2 gap-3">
                  {(['T', 'F'] as const).map((key) => {
                    const isAnswer = question.answer[0] === key;
                    const isPicked = picked.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={revealed}
                        onClick={() => handleOptionClick(key)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border p-5 transition ${optionStateClass(
                          isAnswer,
                          isPicked,
                        )}`}
                      >
                        <span className="text-3xl leading-none">
                          {key === 'T' ? '○' : '✕'}
                        </span>
                        <span className="text-sm font-semibold">
                          {key === 'T' ? '正確' : '錯誤'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          按 {key === 'T' ? '1' : '2'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayKeys.map((key, optionIndex) => {
                    const option = question.options?.find(
                      (item) => item.key === key,
                    );
                    if (!option) return null;

                    const isAnswer = question.answer.includes(key);
                    const isPicked = picked.includes(key);
                    const letter = String.fromCharCode(65 + optionIndex);

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={revealed}
                        onClick={() => handleOptionClick(key)}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${optionStateClass(
                          isAnswer,
                          isPicked,
                        )}`}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-black/10 bg-white/70 text-xs font-bold dark:border-white/10 dark:bg-slate-950/50">
                          {letter}
                        </span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap text-[15px] leading-relaxed">
                          {option.text}
                        </span>
                        {revealed && isAnswer && (
                          <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        )}
                        {revealed && isPicked && !isAnswer && (
                          <IconX className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </article>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={session.index === 0}
              aria-label="上一題"
              className="btn-ghost px-4"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>

            {revealed ? (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary flex-1 py-3.5"
              >
                {session.index === total - 1 ? '查看本輪結果' : '下一題'}
                <IconChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitAnswer(question.id, picked)}
                disabled={picked.length === 0}
                className="btn-primary flex-1 py-3.5"
              >
                確認答案
              </button>
            )}
          </div>
        </div>
      </main>

      <aside
        id="question-nav-desktop"
        aria-label="題目導覽"
        aria-hidden={!navOpen}
        inert={!navOpen}
        className={`hidden shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-20 lg:block lg:self-start ${
          navOpen ? 'w-60 pl-5 opacity-100' : 'w-0 pl-0 opacity-0'
        }`}
      >
        <div
          className={`card scrollbar-slim overflow-y-auto p-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            navOpen ? 'translate-x-0' : 'translate-x-6'
          }`}
          style={{
            height: navHeight,
            maxHeight: 'calc(100dvh - 6rem)',
          }}
        >
          <QuestionNav
            session={session}
            answered={answered}
            onGoTo={selectQuestion}
            onClose={() => setNavOpen(false)}
          />
        </div>
      </aside>

      <div
        onClick={() => setNavOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          navOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="question-nav-drawer"
        aria-label="題目導覽"
        aria-hidden={!navOpen}
        inert={!navOpen}
        className={`card scrollbar-slim fixed inset-y-0 right-0 z-40 flex w-72 max-w-[85vw] flex-col overflow-y-auto rounded-none rounded-l-2xl border-y-0 border-r-0 p-4 shadow-2xl shadow-slate-950/30 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          navOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <QuestionNav
          session={session}
          answered={answered}
          onGoTo={selectQuestion}
          onClose={() => setNavOpen(false)}
        />
      </aside>
    </div>
  );
}

interface QuestionNavProps {
  session: Session;
  answered: number;
  onGoTo: (index: number) => void;
  onClose: () => void;
}

function QuestionNav({ session, answered, onGoTo, onClose }: QuestionNavProps) {
  const total = session.queue.length;

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">題目導覽</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {answered} / {total} 已作答
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="收合題目導覽"
          className="btn-ghost h-8 w-8 shrink-0 px-0 hover:rotate-90"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {session.queue.map((id, index) => {
          const result = session.results[id];
          const current = index === session.index;
          const tone =
            result === true
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : result === false
                ? 'border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400';

          return (
            <button
              key={id}
              type="button"
              onClick={() => onGoTo(index)}
              aria-label={`第 ${index + 1} 題`}
              aria-current={current ? 'step' : undefined}
              className={`h-8 rounded-lg border text-xs font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-sm active:translate-y-0 active:scale-95 ${tone} ${
                current
                  ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-950'
                  : ''
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          答對
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          答錯
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          未作答
        </span>
      </div>
    </div>
  );
}

interface SessionSummaryProps {
  session: Session;
  answered: number;
  correct: number;
  onExit: () => void;
  onRestart: () => void;
  onWrongBook: () => void;
}

function SessionSummary({
  session,
  answered,
  correct,
  onExit,
  onRestart,
  onWrongBook,
}: SessionSummaryProps) {
  const total = session.queue.length;
  const accuracy = percent(correct, answered);
  const wrongNumbers = session.queue
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => session.results[id] === false)
    .map(({ index }) => index + 1);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-cyan-500/15 via-transparent to-emerald-500/10 p-8 text-center">
          <p className="eyebrow">本輪完成</p>
          <div className="mt-3 flex items-baseline justify-center gap-1.5">
            <span className="text-6xl font-black tracking-tight">
              {correct}
            </span>
            <span className="text-2xl font-semibold text-slate-400">
              / {answered}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            正確率 {accuracy}% · 共 {total} 題
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {wrongNumbers.length > 0 ? (
            <div>
              <p className="text-sm font-semibold">
                這次答錯 {wrongNumbers.length} 題
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {wrongNumbers.map((number) => (
                  <span key={number} className="chip">
                    第 {number} 題
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                已加入錯題本，連續答對 2 次後才會移出。
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              全部答對，狀態很好。
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onRestart} className="btn-primary">
              再練一次
            </button>
            <button type="button" onClick={onExit} className="btn-ghost">
              回儀表板
            </button>
          </div>

          {wrongNumbers.length > 0 && (
            <button
              type="button"
              onClick={onWrongBook}
              className="mt-4 w-full text-center text-sm font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400"
            >
              前往錯題本
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
