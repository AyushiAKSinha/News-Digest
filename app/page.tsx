"use client";
import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, AlertCircle, Check, X } from "lucide-react";

// Define interfaces for the article and summary
interface Article {
  title: string;
  url: string;
  source: string;
}

interface Summary {
  id: string;
  summary: string;
  sentiment: string;
  explanation: string;
  Article?: Article;
}

const API_URL =
  "https://dmthxkovdjynxiuoldna.hasura.ap-south-1.nhost.run/v1/graphql";
const ADMIN_SECRET = "DuCK9JnVlI_B+h#JOx-c9,(Ul-Co%^7R";

export default function Home() {
  // Use proper types for state variables
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `
          query GetSummaries {
            summaries {
              id
              summary
              sentiment
              explanation
              Article {
                title
                url
                source
              }
            }
          }
        `,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        if (data.errors) throw new Error(data.errors[0].message);
        setSummaries(data.data.summaries);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching summaries:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getSentimentColor = (sentiment: string): string => {
    if (!sentiment) return "bg-gray-100";
    sentiment = sentiment.toLowerCase();
    if (sentiment.includes("positive"))
      return "bg-green-100 text-green-800";
    if (sentiment.includes("negative"))
      return "bg-red-100 text-red-800";
    if (sentiment.includes("neutral"))
      return "bg-blue-100 text-blue-800";
    return "bg-gray-100";
  };

  const getSentimentIcon = (sentiment: string) => {
    if (!sentiment) return <AlertCircle className="w-4 h-4" />;
    sentiment = sentiment.toLowerCase();
    if (sentiment.includes("positive")) return <Check className="w-4 h-4" />;
    if (sentiment.includes("negative")) return <X className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Failed to load news
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-indigo-600 text-white p-3 rounded-full mb-4">
            <Newspaper className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI News Digest
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed with AI-powered summaries of the latest news
          </p>
        </header>

        {summaries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-600">
              No news summaries available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {summaries.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-indigo-100 p-2 rounded-md">
                      <Newspaper className="h-4 w-4 text-indigo-700" />
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {item.Article?.source || "Unknown Source"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {item.Article?.title || "No Title"}
                  </h2>

                  <div className="mb-4">
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
                        item.sentiment
                      )}`}
                    >
                      {getSentimentIcon(item.sentiment)}
                      <span className="ml-1">
                        {item.sentiment || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">
                    {item.summary || "No summary available."}
                  </p>

                  <a
                    href={item.Article?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                  >
                    Read Full Article
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}