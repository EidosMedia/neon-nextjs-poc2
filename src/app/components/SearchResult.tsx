'use client';
import { PaginatedSearchRagResult, Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, RotateCcw } from 'lucide-react';
import { Button } from './baseComponents/button';
import SearchResultItem from './SearchResultItem';
import { Input } from './baseComponents/textInput';
import CustomSelect from './baseComponents/select';
import AiSearchIcon from './icons/AiSearch';
import Link from 'next/link';

/** Minimal markdown → React elements: bold, italic, unordered lists, paragraphs.
 *  Also strips XML-like tool tags (e.g. <tool id="search-assistant" />). */
function SimpleMarkdown({ text }: { text: string }) {
  // Strip self-closing XML tool tags injected by the backend
  const cleaned = text.replace(/<[a-zA-Z][^>]*\/>/g, '').trim();
  const paragraphs = cleaned.split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-1.5">
      {paragraphs.map((block, i) => {
        const blockTrimmed = block.trim();
        if (!blockTrimmed) return null;
        const lines = blockTrimmed.split('\n');
        const isList = lines.some(l => l.trimStart().startsWith('- '));
        if (isList) {
          return (
            <ul key={i} className="list-disc list-inside space-y-0.5">
              {lines.map((line, j) => {
                const content = line.trimStart().startsWith('- ')
                  ? line.trimStart().slice(2)
                  : line.trim();
                return content ? (
                  <li key={j} className="text-sm leading-relaxed font-[family-name:var(--font-body)]">
                    <InlineText text={content} />
                  </li>
                ) : null;
              })}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed font-[family-name:var(--font-body)]">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <InlineText text={line} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/** Renders inline **bold** and *italic* markers. */
function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  // Match **bold** before *italic* to avoid conflicts
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={match.index}>{match[1]}</strong>);
    } else {
      parts.push(<em key={match.index}>{match[2]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

type ChatRoundTrip = {
  titles: string[];
  question: string;
  answer: string;
  references: PaginatedSearchRagResult['result'];
};

type ActiveTab = 'chat' | 'articles' | 'images' | 'videos';

const THREAD_ID_KEY = 'search-thread-id';

const TABS: { value: ActiveTab; label: string }[] = [
  { value: 'chat', label: 'AI Chat' },
  { value: 'articles', label: 'Articles' },
  { value: 'images', label: 'Images' },
  { value: 'videos', label: 'Videos' },
];

function urlParamToTab(t: string | null): ActiveTab {
  if (t === 'articles' || t === 'images' || t === 'videos') return t;
  return 'chat'; // default and 't=c'
}

function tabToUrlParam(tab: ActiveTab): string {
  if (tab === 'chat') return 'c';
  return tab;
}

function tabToBaseType(tab: ActiveTab): string {
  if (tab === 'images') return 'image';
  if (tab === 'videos') return 'url';
  return 'article'; // 'articles' and fallback
}

const SearchResult = ({ data }: { data: Site }) => {
  const [result, setResult] = useState<PaginatedSearchRagResult>({} as PaginatedSearchRagResult);
  const router = useRouter();
  const query = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [authorized, setAuthorized] = useState(true);
  const [selectedOption, setSelectedOption] = useState('Last Year');
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [selectedResults, setSelectedResults] = useState<Map<string, string>>(new Map<string, string>());
  const [isLoading, setLoading] = useState(false);
  const [isAsking, setAsking] = useState(false);
  const [showAllRefs, setShowAllRefs] = useState(false);
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set());
  const [chat, setChat] = useState<ChatRoundTrip[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [currentChatQuery, setCurrentChatQuery] = useState('');
  const lastSearchText = useRef<string>('');

  // threadId: lazily initialised from sessionStorage on first client render
  const [threadId, setThreadId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const existing = sessionStorage.getItem(THREAD_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(THREAD_ID_KEY, id);
    return id;
  });

  const options = [
    { value: 'Today', text: 'Today' },
    { value: 'Last Week', text: 'Last Week' },
    { value: 'Last Month', text: 'Last Month' },
    { value: 'Last Quarter', text: 'Last Quarter' },
    { value: 'Last Year', text: 'Last Year' },
  ];

  const resetResult = () => {
    setResult({} as PaginatedSearchRagResult);
    setSelectedResults(new Map<string, string>());
  };

  const syncSelectedResults = (items?: PaginatedSearchRagResult['result']) => {
    setSelectedResults(new Map((items ?? []).map(item => [item.nodeData.id, item.nodeData.title || ''])));
  };

  const fetchChatSearch = async (queryText: string, time: string, currentThreadId: string) => {
    if (!authorized) {
      setLoading(false);
      return;
    }

    const queryCallParams = new URLSearchParams();
    queryCallParams.append('query', queryText);
    queryCallParams.append('pastDays', optionToDays(time));
    queryCallParams.append('searchType', 'CHAT');
    if (currentThreadId) queryCallParams.append('threadId', currentThreadId);

    setCurrentChatQuery(queryText);
    setLoading(true);
    resetResult();
    const response = await fetch(`/api/search?${queryCallParams.toString()}`);
    if (response.ok) {
      const responseData = (await response.json()) as PaginatedSearchRagResult;
      setResult({ ...responseData });
    } else {
      resetResult();
      if (response.status === 401 || response.status === 403) setAuthorized(false);
    }
    setLoading(false);
  };

  const fetchStandardSearch = async (queryParams: URLSearchParams, baseType: string) => {
    const queryCallParams = new URLSearchParams();
    if (queryParams.has('query')) queryCallParams.append('query', queryParams.get('query') ?? '');
    const time = queryParams.get('time') ?? 'Last Year';
    queryCallParams.append('startDate', optionToDate(time).toISOString());
    queryCallParams.append('baseType', baseType);

    if (!queryCallParams.has('query')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setChat([]);
    resetResult();
    const response = await fetch(`/api/search?${queryCallParams.toString()}`);
    if (response.ok) {
      const responseData = (await response.json()) as PaginatedSearchRagResult;
      setResult(responseData);
      syncSelectedResults(responseData.result);
    } else {
      resetResult();
    }
    setLoading(false);
  };

  useEffect(() => {
    const queryText = query.get('query');
    const timeText = query.get('time');
    const tParam = query.get('t');
    const tab = urlParamToTab(tParam);

    setActiveTab(tab);
    setSelectedOption(timeText ?? 'Last Year');

    if (queryText) {
      setSearchText(queryText);
      lastSearchText.current = queryText;
      if (tab === 'chat') {
        fetchChatSearch(queryText, timeText ?? 'Last Year', threadId);
      } else {
        fetchStandardSearch(query, tabToBaseType(tab));
      }
    } else {
      setSearchText('');
      setChat([]);
      resetResult();
      setLoading(false);
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildSearchUrl = (tab: ActiveTab, text: string, time: string): string => {
    const params = new URLSearchParams();
    params.append('query', text);
    params.append('time', time);
    params.append('t', tabToUrlParam(tab));
    return `/search?${params.toString()}`;
  };

  const handleOnSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    lastSearchText.current = searchText;
    router.push(buildSearchUrl(activeTab, searchText, selectedOption));
  };

  const handleTabClick = (tab: ActiveTab) => {
    // Clear immediately for instant visual feedback; useEffect will re-fetch
    setActiveTab(tab);
    setChat([]);
    setCurrentChatQuery('');
    resetResult();
    setQuestionText('');
    if (!searchText.trim()) return;
    router.push(buildSearchUrl(tab, searchText, selectedOption));
  };

  const handleResetChat = () => {
    const newId = crypto.randomUUID();
    sessionStorage.setItem(THREAD_ID_KEY, newId);
    setThreadId(newId);
    setChat([]);
    resetResult();
    setQuestionText('');
    setCurrentChatQuery('');
    router.push('/search?t=c');
  };

  const handleChatFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    // Move the current AI answer into history and clear it while waiting for the new one
    if (result?.answer) {
      setChat(prev => [
        ...prev,
        { titles: [], question: currentChatQuery, answer: result.answer, references: result.result ?? [] },
      ]);
      setResult({} as PaginatedSearchRagResult);
      setShowAllRefs(false);
      setExpandedRefs(new Set());
    }

    const followUp = questionText;
    setQuestionText('');
    setCurrentChatQuery(followUp);

    // Fetch follow-up WITHOUT clearing the page (no resetResult / setLoading)
    const queryCallParams = new URLSearchParams();
    queryCallParams.append('query', followUp);
    queryCallParams.append('pastDays', optionToDays(selectedOption));
    queryCallParams.append('searchType', 'CHAT');
    if (threadId) queryCallParams.append('threadId', threadId);

    setAsking(true);
    try {
      const response = await fetch(`/api/search?${queryCallParams.toString()}`);
      if (response.ok) {
        const responseData = (await response.json()) as PaginatedSearchRagResult;
        setResult({ ...responseData });
      } else if (response.status === 401 || response.status === 403) {
        setAuthorized(false);
      }
    } catch (error) {
      console.error('Error during follow-up fetch:', error);
    } finally {
      setAsking(false);
    }
  };

  const handleAnswerToSelection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const selectedKeys = Array.from(selectedResults.keys());
    const queryCallParams = new URLSearchParams();
    queryCallParams.append('query', questionText);

    try {
      setAsking(true);
      const response = await fetch(`/api/askabout?${queryCallParams.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedKeys),
      });

      if (response.ok) {
        const responseData = await response.json();
        setChat(prev => [
          ...prev,
          {
            titles: Array.from(selectedResults.values()),
            question: questionText,
            answer: responseData?.answer || 'No answer provided',
            references: [],
          },
        ]);
        setQuestionText('');
      } else {
        if (response.status === 401 || response.status === 403) {
          setAuthorized(false);
        } else {
          setChat(prev => [
            ...prev,
            {
              titles: Array.from(selectedResults.values()),
              question: questionText,
              answer: `Error ${response.status}`,
              references: [],
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    } finally {
      setAsking(false);
    }
  };

  const changeSelected =
    (id: string, ref: string, title: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedResults(prev => new Map(prev).set(ref, title));
      } else {
        setSelectedResults(prev => {
          const next = new Map(prev);
          next.delete(ref);
          return next;
        });
      }
    };

  const askAboutForm = (
    <form onSubmit={handleAnswerToSelection} className="flex w-full gap-2 mt-2">
      <Input
        type="text"
        id="questionText"
        value={questionText}
        onChange={e => setQuestionText(e.target.value)}
        className="flex-1"
        placeholder="Ask a question about the selected items"
      />
      <Button type="submit" disabled={isAsking}>
        Ask
      </Button>
    </form>
  );

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Search bar — hidden when AI Chat is active with a query */}
      {!(activeTab === 'chat' && currentChatQuery) && (
        <form onSubmit={handleOnSearchFormSubmit} className="mt-6 mb-3">
          <Input
            type="text"
            id="searchText"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            Icon={<AiSearchIcon />}
            placeholder="Search..."
            className="w-full"
          />
        </form>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-(--color-neutral-light) mb-6">
        {TABS.map(tab => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabClick(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.value
                ? 'border-(--color-primary) text-(--color-primary)'
                : 'border-transparent text-(--color-neutral-light-2) hover:text-(--color-neutral-primary)'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-1">
          {activeTab === 'chat' && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResetChat}
              className="text-sm text-(--color-neutral-light-2) flex items-center gap-1 h-8 px-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New chat
            </Button>
          )}
          <CustomSelect
            placeholder=""
            options={options}
            value={selectedOption}
            onChange={v => setSelectedOption(v)}
            className="w-[150px] font-semibold text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'chat' ? (
        /* ── AI Chat: single scroll, sticky references per round (Google-style) ── */
        <div className="flex flex-col gap-10 mt-4 pb-12">

          {/* History rounds: each is a 2-col row — answer left, sticky refs right */}
          {chat.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-8 items-start">
              {/* Left: question + answer */}
              <div className="col-span-2 flex flex-col gap-3">
                <div className="text-sm bg-(--color-neutral-bg) rounded-tl-xl rounded-tr-xl rounded-bl-xl p-3 self-end max-w-prose">
                  <p className="font-[family-name:var(--font-headline)]">{item.question}</p>
                </div>
                <div className="text-sm bg-(--color-primary-lightest) rounded-tl-xl rounded-tr-xl rounded-br-xl p-3 self-start max-w-prose">
                  <SimpleMarkdown text={item.answer} />
                </div>
              </div>
              {/* Right: references — sticky so they stay visible while scrolling the answer */}
              {item.references && item.references.length > 0 && (
                <div className="col-span-1 sticky top-16 self-start">
                  <h4 className="text-sm font-semibold text-(--color-neutral-light-2) uppercase tracking-wide mb-3">
                    References ({item.references.length})
                  </h4>
                  <div className={`flex flex-col gap-3${expandedRefs.has(index) ? ' overflow-y-auto max-h-[420px] pr-1' : ''}`}>
                    {(expandedRefs.has(index) ? item.references : item.references.slice(0, 5)).map((ref) => {
                      const thumb = ref.nodeData.links?.system?.mainPicture?.[0]?.dynamicCropsResourceUrls?.Square_thumb;
                      return (
                        <Link
                          key={ref.nodeData.id}
                          href={ref.nodeData.url}
                          className="flex gap-2 text-sm text-(--color-neutral-primary) hover:text-[var(--color-primary)] leading-snug no-underline"
                        >
                          {thumb && <img src={thumb} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />}
                          <div className="flex flex-col">
                            <p className="font-medium line-clamp-2">
                              {ref.nodeData.attributes?.teaser?.title || ref.nodeData.title}
                            </p>
                            <p className="text-xs text-(--color-neutral-light-2) mt-0.5">
                              {ref.nodeData.pubInfo?.publicationTime
                                ? new Date(ref.nodeData.pubInfo.publicationTime).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                  })
                                : ''}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {!expandedRefs.has(index) && item.references.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setExpandedRefs(prev => new Set(prev).add(index))}
                      className="mt-3 text-sm text-(--color-primary) hover:underline"
                    >
                      Show all ({item.references.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Current round */}
          <div className="grid grid-cols-3 gap-8 items-start">
            {/* Left: current question + answer state + follow-up form */}
            <div className="col-span-2 flex flex-col gap-3">
              {currentChatQuery && (
                <div className="text-sm bg-(--color-neutral-bg) rounded-tl-xl rounded-tr-xl rounded-bl-xl p-3 self-end max-w-prose">
                  <p className="font-[family-name:var(--font-headline)]">{currentChatQuery}</p>
                </div>
              )}
              {(isLoading || isAsking) ? (
                <div className="flex items-center gap-2 text-sm text-(--color-neutral-light-2) self-start">
                  <LoaderCircle className="animate-spin h-4 w-4" />
                  <span>Thinking...</span>
                </div>
              ) : result?.answer ? (
                <div className="bg-(--color-primary-lightest) p-5 rounded-md self-start max-w-prose">
                  <SimpleMarkdown text={result.answer} />
                </div>
              ) : currentChatQuery ? (
                <div className="flex flex-col items-center py-8 text-(--color-neutral-light-2)">
                  <AiSearchIcon className="h-8 w-8 mb-2" />
                  {!authorized ? (
                    <p>You are not authorised to use AI features</p>
                  ) : (
                    <p>No AI answer available for this query</p>
                  )}
                </div>
              ) : null}
              {result?.answer && !isLoading && !isAsking && (
                <form onSubmit={handleChatFollowUp} className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isAsking}>Ask</Button>
                </form>
              )}
            </div>
            {/* Right: current references — sticky */}
            {result?.count > 0 && (
              <div className="col-span-1 sticky top-16 self-start">
                <h4 className="text-sm font-semibold text-(--color-neutral-light-2) uppercase tracking-wide mb-3">
                  References ({result.count})
                </h4>
                <div className={`flex flex-col gap-3${showAllRefs ? ' overflow-y-auto max-h-[420px] pr-1' : ''}`}>
                  {(showAllRefs ? result.result : result.result.slice(0, 5)).map((item) => {
                    const thumb = item.nodeData.links?.system?.mainPicture?.[0]?.dynamicCropsResourceUrls?.Square_thumb;
                    return (
                      <Link
                        key={item.nodeData.id}
                        href={item.nodeData.url}
                        className="flex gap-2 text-sm text-(--color-neutral-primary) hover:text-[var(--color-primary)] leading-snug no-underline"
                      >
                        {thumb && <img src={thumb} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />}
                        <div className="flex flex-col">
                          <p className="font-medium line-clamp-2">
                            {item.nodeData.attributes?.teaser?.title || item.nodeData.title}
                          </p>
                          <p className="text-xs text-(--color-neutral-light-2) mt-0.5">
                            {item.nodeData.pubInfo?.publicationTime
                              ? new Date(item.nodeData.pubInfo.publicationTime).toLocaleDateString('en-GB', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })
                              : ''}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {!showAllRefs && result.result.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllRefs(true)}
                    className="mt-3 text-sm text-(--color-primary) hover:underline"
                  >
                    Show all ({result.result.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : isLoading ? (
        <div className="mt-8 flex flex-col items-center">
          <LoaderCircle className="animate-spin" />
          <p>Loading data...</p>
        </div>
      ) : (
        /* ── Articles / Images / Videos: full-width results ── */
        <div className="flex flex-col items-center">
          {result?.answer && (
            <div className="mt-4 flex flex-col items-center bg-(--color-primary-lightest) p-4 rounded-sm w-full mb-4">
              <h4 className="text-xl font-bold mb-2 mt-2 text-(--color-neutral-primary)">AI Overview</h4>
              <p className="text-left">{result.answer}</p>
            </div>
          )}
          {result.count > 0 && (
            <div className="flex w-full justify-between items-center mb-4 pl-2 gap-2">
              <div>
                <div className="text-left text-semibold font-[family-name:var(--font-headline)]">{result.count} results</div>
                <h2 className="text-left">{lastSearchText.current}</h2>
              </div>
            </div>
          )}
          <div className={activeTab === 'images' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full' : 'grid grid-cols-1 gap-6 w-full'}>
            {result?.count > 0 ? (
              activeTab === 'images' ? (
                result.result.map((item) => (
                  <div key={item.nodeData.id} className="aspect-square overflow-hidden rounded-md bg-(--color-neutral-bg)">
                    <img
                      src={item.nodeData.resourceUrl}
                      alt={item.nodeData.title ?? ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                result.result.map((item, index) => (
                  <SearchResultItem
                    result={item}
                    data={data}
                    key={item.nodeData.id}
                    onChangeSelected={changeSelected}
                    index={index}
                  />
                ))
              )
            ) : (
              <div className="mt-4 flex flex-col items-center">
                <AiSearchIcon className="h-[32px]" />
                <div className="text-center">
                  <h2>No results found</h2>
                  <p>
                    Search content inside {data.root.title}
                    {activeTab === 'images' ? ' — images' : activeTab === 'videos' ? ' — videos' : ''}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResult;

function optionToDate(selectedOption: string): Date {
  const date = new Date();

  switch (selectedOption) {
    case 'Today':
      date.setDate(date.getDate() - 1);
      break;
    case 'Last Week':
      date.setDate(date.getDate() - 7);
      break;
    case 'Last Month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'Last Quarter':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'Last Year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setDate(date.getDate() - 7);
      break;
  }

  // reset the hour, minute and second to 0
  date.setHours(0, 0, 0, 0);
  return date;
}

function optionToDays(selectedOption: string): string {
  switch (selectedOption) {
    case 'Today':
      return '1';
    case 'Last Week':
      return '7';
    case 'Last Month':
      return '30';
    case 'Last Quarter':
      return '120';
    case 'Last Year':
      return '365';
    default:
      return '7';
  }
}
