'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PaginatedSearchRagResult, Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import SearchResultItem from './SearchResultItem';
import SearchIcon from '../chrome/SearchIcon';
import {
  buildSearchUrl, chatSearchParams, DEFAULT_TIME, emptyMessage, formatRefDate, parseAnswer, parseInline, resultHref,
  standardSearchParams, tabToBaseType, TABS, THREAD_ID_KEY, TIME_OPTIONS, urlParamToTab, type ActiveTab,
} from './searchLogic';

type Results = PaginatedSearchRagResult['result'];
type ChatRound = { question: string; answer: string; references: Results };

const REFS_COLLAPSED = 5;

const EMPTY = {} as PaginatedSearchRagResult;

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) =>
        part.style === 'bold' ? <strong key={i}>{part.text}</strong>
          : part.style === 'italic' ? <em key={i}>{part.text}</em>
          : part.text,
      )}
    </>
  );
}

/** The small markdown subset the AI answers use (bold, italic, `- ` lists, paragraphs). */
function Answer({ text }: { text: string }) {
  return (
    <div className="v2-search__answer-text">
      {parseAnswer(text).map((block, i) =>
        block.kind === 'list' ? (
          <ul key={i}>{block.items.map((item, j) => <li key={j}><Inline text={item} /></li>)}</ul>
        ) : (
          <p key={i}>
            {block.lines.map((line, j) => (
              <span key={j}>{j > 0 && <br />}<Inline text={line} /></span>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

function References({ items, expanded, onExpand }: { items: Results; expanded: boolean; onExpand: () => void }) {
  const shown = expanded ? items : items.slice(0, REFS_COLLAPSED);
  return (
    <aside className="v2-search__refs" aria-label="References">
      <h2 className="v2-search__refs-title">References ({items.length})</h2>
      <ul className={`v2-search__refs-list${expanded ? ' v2-search__refs-list--open' : ''}`}>
        {shown.map((item) => {
          const thumb = item.nodeData.links?.system?.mainPicture?.[0]?.dynamicCropsResourceUrls?.Square_thumb;
          return (
            <li key={item.nodeData.id}>
              <Link href={resultHref(item)} className="v2-search__ref">
                {thumb && <img src={thumb} alt="" />}
                <span>
                  <span className="v2-search__ref-title">
                    {item.nodeData.attributes?.teaser?.title || item.nodeData.title}
                  </span>
                  <span className="v2-search__ref-date">{formatRefDate(item.nodeData.pubInfo?.publicationTime)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {!expanded && items.length > REFS_COLLAPSED && (
        <button type="button" className="v2-btn v2-btn--link" onClick={onExpand}>
          Show all ({items.length})
        </button>
      )}
    </aside>
  );
}

/** v2 site search: AI chat plus article, image and video results. Same endpoints and URL params as the legacy page. */
export default function Search({ data }: { data: Site }) {
  const id = useId();
  const router = useRouter();
  const query = useSearchParams();
  const [result, setResult] = useState<PaginatedSearchRagResult>(EMPTY);
  const [searchText, setSearchText] = useState('');
  const [authorized, setAuthorized] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>(DEFAULT_TIME);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isLoading, setLoading] = useState(false);
  const [isAsking, setAsking] = useState(false);
  const [showAllRefs, setShowAllRefs] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set());
  const [chat, setChat] = useState<ChatRound[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [currentChatQuery, setCurrentChatQuery] = useState('');
  const lastSearchText = useRef('');

  // The conversation id lives in sessionStorage so a reload keeps the same thread.
  const [threadId, setThreadId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const existing = sessionStorage.getItem(THREAD_ID_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(THREAD_ID_KEY, fresh);
    return fresh;
  });

  const resetResult = () => setResult(EMPTY);

  const fetchChatSearch = async (queryText: string, time: string, currentThreadId: string) => {
    if (!authorized) {
      setLoading(false);
      return;
    }
    setCurrentChatQuery(queryText);
    setLoading(true);
    resetResult();
    try {
      const response = await fetch(`/api/search?${chatSearchParams(queryText, time, currentThreadId)}`);
      if (response.ok) {
        setResult({ ...((await response.json()) as PaginatedSearchRagResult) });
      } else if (response.status === 401 || response.status === 403) {
        setAuthorized(false);
      }
    } catch (error) {
      console.error('Error during chat search:', error);
    }
    setLoading(false);
  };

  const fetchStandardSearch = async (urlParams: URLSearchParams, baseType: string) => {
    const params = standardSearchParams(urlParams, baseType);
    if (!params) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setChat([]);
    resetResult();
    try {
      const response = await fetch(`/api/search?${params}`);
      if (response.ok) setResult((await response.json()) as PaginatedSearchRagResult);
    } catch (error) {
      console.error('Error during search:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const queryText = query.get('query');
    const timeText = query.get('time');
    const tab = urlParamToTab(query.get('t'));

    setActiveTab(tab);
    setSelectedOption(timeText ?? DEFAULT_TIME);

    if (queryText) {
      setSearchText(queryText);
      lastSearchText.current = queryText;
      if (tab === 'chat') {
        fetchChatSearch(queryText, timeText ?? DEFAULT_TIME, threadId);
      } else {
        fetchStandardSearch(new URLSearchParams(query.toString()), tabToBaseType(tab));
      }
    } else {
      setSearchText('');
      setChat([]);
      resetResult();
      setLoading(false);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    lastSearchText.current = searchText;
    router.push(buildSearchUrl(activeTab, searchText, selectedOption));
  };

  const handleTabClick = (tab: ActiveTab) => {
    // Clear immediately; the URL change re-fetches.
    setActiveTab(tab);
    setChat([]);
    setCurrentChatQuery('');
    resetResult();
    setQuestionText('');
    if (!searchText.trim()) return;
    router.push(buildSearchUrl(tab, searchText, selectedOption));
  };

  const handleResetChat = () => {
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(THREAD_ID_KEY, fresh);
    setThreadId(fresh);
    setChat([]);
    resetResult();
    setQuestionText('');
    setCurrentChatQuery('');
    router.push('/search?t=c');
  };

  const handleFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    // The current answer moves into history while the next one loads.
    if (result?.answer) {
      setChat((prev) => [...prev, { question: currentChatQuery, answer: result.answer, references: result.result ?? [] }]);
      setResult(EMPTY);
      setShowAllRefs(false);
      setExpandedRefs(new Set());
    }
    const followUp = questionText;
    setQuestionText('');
    setCurrentChatQuery(followUp);
    setAsking(true);
    try {
      const response = await fetch(`/api/search?${chatSearchParams(followUp, selectedOption, threadId)}`);
      if (response.ok) {
        setResult({ ...((await response.json()) as PaginatedSearchRagResult) });
      } else if (response.status === 401 || response.status === 403) {
        setAuthorized(false);
      }
    } catch (error) {
      console.error('Error during follow-up fetch:', error);
    } finally {
      setAsking(false);
    }
  };

  const busy = isLoading || isAsking;
  const chatActive = activeTab === 'chat';

  return (
    <div className="v2-search">
      {!(chatActive && currentChatQuery) && (
        <form onSubmit={handleSearchSubmit} className="v2-search__form" role="search">
          <label className="v2-field__label" htmlFor={`${id}-q`}>Search {data.root?.title}</label>
          <div className="v2-search__box">
            <SearchIcon />
            <input
              id={`${id}-q`} type="search" value={searchText} placeholder="Search..."
              onChange={(e) => setSearchText(e.target.value)} className="v2-search__input"
            />
            {searchText && (
              <button type="button" className="v2-search__clear" aria-label="Clear search" onClick={() => setSearchText('')}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 3l12 12M15 3L3 15" />
                </svg>
              </button>
            )}
          </div>
        </form>
      )}

      <div className="v2-tabs">
        <div role="tablist" aria-label="Search type" className="v2-tabs__list">
          {TABS.map((tab) => (
            <button
              key={tab.value} type="button" role="tab" id={`${id}-tab-${tab.value}`}
              aria-selected={activeTab === tab.value} aria-controls={`${id}-panel`}
              className={`v2-tabs__tab${activeTab === tab.value ? ' v2-tabs__tab--active' : ''}`}
              onClick={() => handleTabClick(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="v2-tabs__tools">
          {chatActive && (
            <button type="button" className="v2-btn v2-btn--ghost" onClick={handleResetChat}>New chat</button>
          )}
          <label className="v2-visually-hidden" htmlFor={`${id}-time`}>Time range</label>
          <select
            id={`${id}-time`} className="v2-field__control v2-tabs__select" value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            {TIME_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${activeTab}`} aria-busy={busy}>
        {chatActive ? (
          <div className="v2-search__chat">
            {chat.map((round, index) => (
              <section key={index} className="v2-search__round">
                <div className="v2-search__thread">
                  <p className="v2-search__question">{round.question}</p>
                  <div className="v2-search__answer"><Answer text={round.answer} /></div>
                </div>
                {round.references.length > 0 && (
                  <References
                    items={round.references} expanded={expandedRefs.has(index)}
                    onExpand={() => setExpandedRefs((prev) => new Set(prev).add(index))}
                  />
                )}
              </section>
            ))}

            <section className="v2-search__round">
              <div className="v2-search__thread">
                {currentChatQuery && <p className="v2-search__question">{currentChatQuery}</p>}
                <div aria-live="polite">
                  {busy ? (
                    <p className="v2-search__status">Thinking...</p>
                  ) : result?.answer ? (
                    <div className="v2-search__answer"><Answer text={result.answer} /></div>
                  ) : currentChatQuery ? (
                    <p className="v2-search__status">
                      {authorized ? 'No AI answer available for this query' : 'You are not authorised to use AI features'}
                    </p>
                  ) : null}
                </div>
                {result?.answer && !busy && (
                  <form onSubmit={handleFollowUp} className="v2-search__followup">
                    <label className="v2-visually-hidden" htmlFor={`${id}-follow`}>Follow-up question</label>
                    <input
                      id={`${id}-follow`} type="text" value={questionText} className="v2-field__control"
                      placeholder="Ask a follow-up question..." onChange={(e) => setQuestionText(e.target.value)}
                    />
                    <button type="submit" className="v2-btn" disabled={isAsking}>Ask</button>
                  </form>
                )}
              </div>
              {result?.count > 0 && (
                <References items={result.result} expanded={showAllRefs} onExpand={() => setShowAllRefs(true)} />
              )}
            </section>
          </div>
        ) : isLoading ? (
          <p className="v2-search__status" role="status">Loading data...</p>
        ) : (
          <div className="v2-search__results">
            {result?.answer && (
              <section className="v2-search__overview">
                <h2>AI Overview</h2>
                <p>{result.answer}</p>
              </section>
            )}
            {result.count > 0 && (
              <h2 className="v2-search__count">
                {result.count} {result.count === 1 ? 'result' : 'results'} for “{lastSearchText.current}”
              </h2>
            )}
            {result?.count > 0 ? (
              activeTab === 'images' ? (
                <ul className="v2-search__images">
                  {result.result.map((item) => (
                    <li key={item.nodeData.id}>
                      <img src={item.nodeData.resourceUrl} alt={item.nodeData.title ?? ''} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="v2-search__list">
                  {result.result.map((item) => (
                    <SearchResultItem key={item.nodeData.id} result={item} data={data} />
                  ))}
                </div>
              )
            ) : (
              <div className="v2-search__empty">
                <SearchIcon size={44} />
                <h2>{lastSearchText.current ? 'No results found' : `Search ${data.root?.title ?? ''}`.trim()}</h2>
                <p>{emptyMessage(activeTab, lastSearchText.current, selectedOption)}</p>
                {lastSearchText.current && selectedOption !== DEFAULT_TIME && (
                  <button
                    type="button" className="v2-btn v2-btn--ghost"
                    onClick={() => router.push(buildSearchUrl(activeTab, lastSearchText.current, DEFAULT_TIME))}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
