import { Navigate, Route, Routes } from "react-router-dom";
import { BookDetail } from "./pages/BookDetail";
import { BookForm } from "./pages/BookForm";
import { Home } from "./pages/Home";

export default function App() {
  return (
    <div className="app-canvas">
      <div className="app-frame">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/livros/novo" element={<BookForm />} />
          <Route path="/livros/:id" element={<BookDetail />} />
          <Route path="/livros/:id/editar" element={<BookForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
