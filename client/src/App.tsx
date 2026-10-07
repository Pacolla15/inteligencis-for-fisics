import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { FormulasPage } from './pages/FormulasPage';
import { SimulationsListPage } from './pages/SimulationsListPage';
import { SimulationDetailPage } from './pages/SimulationDetailPage';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-80 gap-4 px-4 text-center">
    <div className="text-6xl font-black text-slate-300 dark:text-slate-700">404</div>
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Página não encontrada</h1>
    <p className="text-slate-500 text-sm">A rota solicitada não existe nesta plataforma.</p>
    <a href="/" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
      Voltar ao início
    </a>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/mecanica/:slug" element={<TopicPage />} />
              <Route path="/formulas" element={<FormulasPage />} />
              <Route path="/simulacoes" element={<SimulationsListPage />} />
              <Route path="/simulacoes/:id" element={<SimulationDetailPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
