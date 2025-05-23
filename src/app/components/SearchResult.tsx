'use client';
import { PaginatedSearchRagResult, RagOnItemsResponse, Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ArticleOverlay from './base/ArticleOverlay';
import { LoaderCircle } from 'lucide-react';
import ErrorBoundaryContainer from './base/ErrorBoundaryContainer/ErrorBoundaryContainer';

type ChatRoundTrip = {
  titles: string[];
  question: string;
  answer: string;
};

const SearchResult = ({ data }: { data: Site }) => {
  const [result, setResult] = useState<PaginatedSearchRagResult>({} as PaginatedSearchRagResult);

  const router = useRouter();
  const query = useSearchParams();
  const [searchText, setSearchText] = useState('');
  const [authorized, setAuthorized] = useState(true);
  const [selectedOption, setSelectedOption] = useState('Last Week');
  const [selectedResults, setSelectedResults] = useState<Map<string, string>>(new Map<string, string>());
  const options = ['Today', 'Last Week', 'Last Month', 'Last Quarter', 'Last Year'];
  const [isLoading, setLoading] = useState(true);
  const [isAsking, setAsking] = useState(false);
  const [chat, setChat] = useState<ChatRoundTrip[]>([]);
  const [questionText, setQuestionText] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionText(e.target.value);
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  /** route client to server api exposed for default search */
  const fetchSearch = async (queryParams: URLSearchParams) => {
    const queryCallParams = new URLSearchParams();

    if (queryParams.has('query')) {
      queryCallParams.append('query', queryParams.get('query') ?? '');
    }
    if (queryParams.has('time')) {
      const date = optionToDate(queryParams.get('time') ?? '');

      queryCallParams.append('startDate', date.toISOString());
    }

    if (queryCallParams.size >= 2 && queryCallParams.has('query') && queryCallParams.has('startDate')) {
      const response = await fetch(`/api/search?${queryCallParams.toString()}`);
      setLoading(true);
      setChat([]);
      setResult({} as PaginatedSearchRagResult);
      setSelectedResults(new Map<string, string>());
      if (response.ok) {
        const search = (await response.json()) as PaginatedSearchRagResult;

        console.log('Fetched data:', search);
        setResult(search);
        setSelectedResults(new Map(search.result.map(item => [item.nodeData.id, item.nodeData.title || ''])));
      } else {
        console.log('Fetched rag data error', response);
        setResult({} as PaginatedSearchRagResult);
        setSelectedResults(new Map<string, string>());
      }
    }
    setLoading(false);
  };

  /** route client to server api exposed for natural search */
  const fetchNaturalSearch = async (queryParams: URLSearchParams) => {
    const queryCallParams = new URLSearchParams();

    if (queryParams.has('query')) {
      queryCallParams.append('query', queryParams.get('query') ?? '');
    }
    if (queryParams.has('time')) {
      queryCallParams.append('pastDays', optionToDays(queryParams.get('time') ?? ''));
    }

    queryCallParams.append('rag', 'true');

    if (queryCallParams.size === 3 && queryCallParams.has('query') && queryCallParams.has('pastDays') && authorized) {
      setLoading(true);
      setChat([]);
      setResult({} as PaginatedSearchRagResult);
      setSelectedResults(new Map<string, string>());
      const response = await fetch(`/api/search?${queryCallParams.toString()}`);
      if (response.ok) {
        const data = (await response.json()) as PaginatedSearchRagResult;

        console.log('Fetched rag data:', data);
        setResult(data);
        setSelectedResults(new Map(data.result.map(item => [item.nodeData.id, item.nodeData.title || ''])));
      } else {
        console.log('Fetched rag data error', response);
        setResult({} as PaginatedSearchRagResult);
        setSelectedResults(new Map<string, string>());
        if (response.status === 401 || response.status == 403) {
          setAuthorized(false);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const queryText = query.get('query');
    const timeText = query.get('time');

    if (queryText) {
      setSearchText(queryText);
    }
    if (timeText) {
      setSelectedOption(timeText);
    }

    if (query.get('t') && query.get('t') === 'n') {
      fetchNaturalSearch(query);
    } else {
      fetchSearch(query);
    }
  }, [query]); // Refetch data when query parameters change

  const getQueryParams = (): URLSearchParams => {
    const queryParams = new URLSearchParams();
    if (searchText) {
      queryParams.append('query', searchText);
    }
    queryParams.append('time', selectedOption);

    return queryParams;
  };

  const handleSearch = async () => {
    if (!searchText || searchText.trim() === '') return;

    const queryParams = getQueryParams();

    // Update the URL with query parameters
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleAiSearch = async () => {
    if (!searchText || searchText.trim() === '') return;

    const queryParams = getQueryParams();

    queryParams.append('t', 'n');

    // Update the URL with query parameters
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleAnswerToSelection = async () => {
    console.log(`Question about selected results: ${questionText}`);

    const selectedKeys = Array.from(selectedResults.keys());
    const queryCallParams = new URLSearchParams();

    queryCallParams.append('query', questionText);

    try {
      if (questionText.trim() === '') return;

      setAsking(true);
      const response = await fetch(`/api/askabout?${queryCallParams.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedKeys),
      });

      if (response.ok) {
        const ragAnwser: RagOnItemsResponse = (await response.json()) as RagOnItemsResponse;

        console.log('askabout response:', data);

        const newChatRoundTrip: ChatRoundTrip = {
          titles: Array.from(selectedResults.values()),
          question: questionText,
          answer: ragAnwser.result.answer,
        };

        setChat(prevChat => [...prevChat, newChatRoundTrip]);
        setQuestionText('');
      } else {
        console.log('askabout error', response);
        if (response.status === 401 || response.status == 403) {
          setAuthorized(false);
        } else {
          const newChatRoundTrip: ChatRoundTrip = {
            titles: Array.from(selectedResults.values()),
            question: questionText,
            answer: `for error ${response.status} as answer`,
          };

          setChat(prevChat => [...prevChat, newChatRoundTrip]);
        }
      }
      setAsking(false);
    } catch (error) {
      console.error('Error during fetch:', error);
      setAsking(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column', // Stack elements vertically
        height: '100vh', // Full viewport height
        textAlign: 'center', // Center text alignment
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            paddingLeft: '8px',
          }}
        >
          <label className="relative inline-flex items-center cursor-pointer">Search:</label>
          <input
            type="text"
            id="searchText"
            value={searchText}
            onChange={handleTextChange}
            style={{ marginLeft: '8px', marginRight: '8px', border: '1px solid #ccc', padding: '1px', width: '600px' }}
            placeholder="Enter search text"
          />

          <label className="relative inline-flex items-center cursor-pointer">Time frame:</label>
          <select
            id="options"
            value={selectedOption}
            onChange={handleOptionChange}
            style={{ padding: '1px', border: '1px solid #ccc' }}
          >
            <option value="">Select an option</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: !isLoading ? '#007BFF' : '#ccc', // Solid blue background
            color: '#fff', // White text
            border: 'none', // Remove border
            borderRadius: '4px', // Rounded corners
            cursor: !isLoading ? 'pointer' : 'not-allowed', // Pointer cursor on hover
            width: '100px', // Fixed width
            margin: '4px', // Space between buttons
          }}
          onClick={handleSearch}
          disabled={isLoading}
        >
          Search
        </button>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: authorized && !isLoading ? '#007BFF' : '#ccc', // Solid blue if authorized, gray if not
            color: '#fff', // White text
            border: 'none', // Remove border
            borderRadius: '4px', // Rounded corners
            cursor: authorized || !isLoading ? 'pointer' : 'not-allowed', // Pointer cursor if authorized, not-allowed if not
            width: '100px', // Fixed width
            margin: '4px',
          }}
          onClick={handleAiSearch}
          disabled={!authorized || isLoading} // Disable button if not authorized
        >
          AI Search
        </button>
      </div>

      {
        /* Render search results */
        isLoading ? (
          <div style={{ marginTop: '16px', justifyContent: 'center' }}>
            <div style={{ marginTop: '16px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              <LoaderCircle className="animate-spin" />
            </div>
            <p>Loading data...</p>
          </div>
        ) : (
          <div style={{ marginTop: '16px', alignItems: 'center' }}>
            {result?.answer ? (
              <div style={{ marginTop: '16px', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  AI Answer:
                </h2>
                <p style={{ textAlign: 'left' }}>
                  <i>{result?.answer}</i>
                </p>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  Response references
                </h3>
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  Search Results:
                </h3>
              </div>
            )}
            {result?.count > 0 ? (
              result.result.map((result, index) => {
                var title, summary;
                if (result.nodeData.attributes?.teaser?.title) {
                  title = result.nodeData.attributes.teaser.title;
                } else {
                  title = result.nodeData.title;
                }
                if (result.nodeData.attributes?.teaser?.summary) {
                  summary = result.nodeData.attributes.teaser.summary;
                } else {
                  summary = result.nodeData.summary;
                }

                const changeSelected =
                  (id: string, ref: string, title: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
                    console.log(`Checkbox for item ${id} changed to ${event.target.checked} for ref:${ref}`);
                    // Implement any additional logic for handling the checkbox state change here
                    if (event.target.checked) {
                      setSelectedResults(prev => new Map(prev).set(ref, title));
                    } else {
                      setSelectedResults(prev => {
                        const newSet = new Map(prev);
                        newSet.delete(ref);
                        return newSet;
                      });
                    }
                    console.log(
                      `Selected results: ${Array.from(selectedResults.entries())
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}`
                    );
                  };

                return (
                  <div key={result.nodeData.id} className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <div className="col-span-1 relative group">
                      <ArticleOverlay data={data.root} viewStatus={data.viewStatus}>
                        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
                          <input
                            type="checkbox"
                            id="sel{index}"
                            onChange={changeSelected(`sel${index}`, result.nodeData.id, title)}
                            defaultChecked={true}
                          />
                        </div>
                        <ErrorBoundaryContainer>
                          <Link className="no-underline" href={result.nodeData.url}>
                            <div className="p-4 flex" style={{ textAlign: 'left' }}>
                              <div id="photo{index}" className="mr-4">
                                <img
                                  alt="/static/img/nothumb.jpeg"
                                  width="200"
                                  height="200"
                                  decoding="async"
                                  data-nimg="1"
                                  src={
                                    result.nodeData.links?.system?.mainPicture[0]?.dynamicCropsResourceUrls
                                      .Portrait_small
                                  }
                                  className="w-48 h-48 object-cover"
                                  style={{ color: 'transparent' }}
                                />
                              </div>
                              <div id="item{index}" className="flex-1">
                                <h6 className="text-xl font-semibold">{title}</h6>
                                <p className="text-base">{summary}</p>
                                {result.highlights && result.highlights['_full_text.content.all'] ? (
                                  result.highlights['_full_text.content.all'].map((reference, idx) => (
                                    <p key={idx}>... {reference.replaceAll('\n', ' ')} ...</p>
                                  ))
                                ) : (
                                  <p />
                                )}
                              </div>
                            </div>
                          </Link>
                        </ErrorBoundaryContainer>
                      </ArticleOverlay>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ marginTop: '16px' }}>
                {!authorized && query.get('t') === 'n' ? (
                  <p>You are not unauthorized to use AI features.</p>
                ) : (
                  <p>No results found.</p>
                )}
              </div>
            )}
            {chat.length > 0 ? (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  AI Chat History:
                </h3>
                {chat.map((item, index) => (
                  <div key={index} style={{ marginTop: '16px', marginBottom: '16px', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.1rem', marginTop: '4px', textAlign: 'left' }}>
                      <p>
                        Question:
                        <br />
                        <b>{item.question}</b>
                      </p>
                    </div>
                    <div style={{ fontSize: '1.1rem', marginTop: '4px', textAlign: 'right' }}>
                      <p>
                        Answer:
                        <br />
                        <i>{item.answer}</i>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}></div>
            )}
            {authorized && selectedResults.size > 0 ? (
              <div style={{ marginTop: '16px', textAlign: 'left' }}>
                <ul style={{ marginBottom: '8px', color: '#333' }}>
                  <i>Using the set of select results:</i>
                  {Array.from(selectedResults.entries()).map(([key, value], index) => {
                    return (
                      <li key={index} style={{ marginTop: '8px', marginLeft: '20px' }}>
                        <p>
                          <span style={{ marginRight: '8px', color: 'black' }}>•</span>
                          <i>{value}</i>
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                    marginBottom: '16px',
                    paddingLeft: '8px',
                  }}
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <b>Ask about that content:</b>
                  </label>
                  <input
                    type="text"
                    id="questionText"
                    value={questionText}
                    onChange={handleQuestionTextChange}
                    style={{
                      marginLeft: '8px',
                      marginRight: '8px',
                      border: '1px solid #ccc',
                      padding: '1px',
                      width: '70%',
                    }}
                    placeholder="Enter question about selected"
                  />
                  <button
                    type="button"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: !isAsking ? '#007BFF' : '#ccc',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: !isAsking ? 'pointer' : 'not-allowed', // Pointer cursor if authorized, not-allowed if not
                      marginLeft: '8px',
                    }}
                    onClick={handleAnswerToSelection}
                    disabled={isAsking}
                  >
                    Ask
                  </button>
                </div>
                {isAsking ? (
                  <div style={{ textAlign: 'center', marginLeft: '8px' }}>
                    <div style={{ marginTop: '16px', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                      <LoaderCircle className="animate-spin" />
                    </div>
                    <p>Asking...</p>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px' }}></div>
                )}
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}></div>
            )}
          </div>
        )
      }
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
