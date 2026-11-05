import { useCallback, useEffect, useState } from "react";
import { bookApi } from "../services/api";
import type { Book, BookListResponse, BookStatus, BookSummary } from "../types";
import { getErrorMessage, isNotFoundError } from "../utils/formatters";
import { useToast } from "../contexts/ToastContext";

type BooksRequestParams = {
  page: number;
  limit: number;
  status?: BookStatus;
  q?: string;
};

export function useBooks(params: BooksRequestParams) {
  const { showToast } = useToast();
  const [result, setResult] = useState<BookListResponse | null>(null);
  const [summary, setSummary] = useState<BookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    Promise.allSettled([
      bookApi.list(params),
      bookApi.summary(),
    ])
      .then(([booksResponse, summaryResponse]) => {
        if (!active) return;
        if (booksResponse.status === "fulfilled") {
          setResult(booksResponse.value);
        } else {
          setLoadError(true);
          showToast(getErrorMessage(booksResponse.reason), "error");
        }
        if (summaryResponse.status === "fulfilled") {
          setSummary(summaryResponse.value);
        } else {
          showToast(
            `Não foi possível carregar o resumo da estante. ${getErrorMessage(summaryResponse.reason)}`,
            "error",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.page, params.limit, params.q, params.status, refreshKey, showToast]);

  const updateBook = useCallback(
    async (id: string, status: BookStatus) => {
      try {
        await bookApi.update(id, { status });
        refresh();
        return true;
      } catch (error) {
        showToast(getErrorMessage(error), "error");
        return false;
      }
    },
    [refresh, showToast],
  );

  return {
    books: result?.items ?? [],
    meta: result?.meta,
    summary,
    loading,
    loadError,
    refresh,
    updateBook,
  };
}

export function useBook(id: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    if (!id) {
      setBook(null);
      setLoadError(null);
      setNotFound(false);
      setLoading(false);
      return;
    }
    setBook(null);
    setLoadError(null);
    setNotFound(false);
    setLoading(true);
    bookApi
      .get(id)
      .then((result) => {
        if (active) setBook(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(getErrorMessage(error));
          setNotFound(isNotFoundError(error));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  return { book, loading, loadError, notFound, refresh };
}
