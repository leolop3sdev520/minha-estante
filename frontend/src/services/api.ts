import axios from "axios";
import type {
  Book,
  BookListResponse,
  BookPayload,
  BookUpdatePayload,
  BookStatus,
  BookSummary,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const bookApi = {
  async list(params: {
    page: number;
    limit: number;
    status?: BookStatus;
    q?: string;
  }) {
    const { data } = await api.get<BookListResponse>("/livros", { params });
    return data;
  },

  async summary() {
    const { data } = await api.get<BookSummary>("/resumo");
    return data;
  },

  async get(id: string) {
    const { data } = await api.get<Book>(`/livros/${id}`);
    return data;
  },

  async create(payload: BookPayload) {
    const { data } = await api.post<Book>("/livros", payload);
    return data;
  },

  async update(id: string, payload: BookUpdatePayload) {
    const { data } = await api.patch<Book>(`/livros/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    await api.delete(`/livros/${id}`);
  },
};

export default api;
