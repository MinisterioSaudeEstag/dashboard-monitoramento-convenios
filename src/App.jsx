import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, MapPin, Calendar, UploadCloud, HelpCircle, Menu } from 'lucide-react';
import { processExcelFile } from './utils/dataProcessor';
import DashboardInicio from './pages/DashboardInicio';
import DashboardExecucao from './pages/DashboardExecucao';
import DashboardMapa from './pages/DashboardMapa';
import DashboardPrazos from './pages/DashboardPrazos';
import './index.css';

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="sidebar-sus">
      <div className="sidebar-top">
        <div className="sidebar-logo-top">
          <img src="/logo-ministerio-saude.png" alt="Ministério da Saúde - Governo Federal" />
        </div>
        
        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={20} /> Início
          </Link>
          <Link to="/execucao" className={`nav-link ${location.pathname === '/execucao' ? 'active' : ''}`}>
            <BarChart2 size={20} /> Execução
          </Link>
          <Link to="/mapa" className={`nav-link ${location.pathname === '/mapa' ? 'active' : ''}`}>
            <MapPin size={20} /> Mapa
          </Link>
          <Link to="/prazos" className={`nav-link ${location.pathname === '/prazos' ? 'active' : ''}`}>
            <Calendar size={20} /> Prazos
          </Link>
        </nav>
      </div>

      <div className="sidebar-logo-bottom">
        <img src="/logo-sus.png" alt="Sistema Único de Saúde" />
      </div>
    </aside>
  );
};

const MobileHeader = () => (
  <div className="mobile-header-bar">
    <Menu size={22} color="#fff" />
    <span className="mobile-header-title">MONITORAMENTO DE CONVÊNIOS</span>
    <HelpCircle size={20} color="#fff" />
  </div>
);

const MobileBottomNav = () => {
  const location = useLocation();
  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={20} />
        <span>Início</span>
      </Link>
      <Link to="/execucao" className={`mobile-nav-item ${location.pathname === '/execucao' ? 'active' : ''}`}>
        <BarChart2 size={20} />
        <span>Execução</span>
      </Link>
      <Link to="/mapa" className={`mobile-nav-item ${location.pathname === '/mapa' ? 'active' : ''}`}>
        <MapPin size={20} />
        <span>Mapa</span>
      </Link>
      <Link to="/prazos" className={`mobile-nav-item ${location.pathname === '/prazos' ? 'active' : ''}`}>
        <Calendar size={20} />
        <span>Prazos</span>
      </Link>
    </nav>
  );
};

export default function App() {
  const [dadosPlanilha, setDadosPlanilha] = useState([]);
  const [dataAtualizacao, setDataAtualizacao] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('sismob_dados');
    const dataSalva = localStorage.getItem('sismob_data_atualizacao');
    
    if (dadosSalvos) setDadosPlanilha(JSON.parse(dadosSalvos));
    if (dataSalva) setDataAtualizacao(dataSalva);
  }, []);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    processExcelFile(file, (jsonDados) => {
      setDadosPlanilha(jsonDados);
      
      const agora = new Date();
      const dataFormatada = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      setDataAtualizacao(dataFormatada);

      localStorage.setItem('sismob_dados', JSON.stringify(jsonDados));
      localStorage.setItem('sismob_data_atualizacao', dataFormatada);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <MobileHeader />

        <Sidebar />
        
        <main className="main-content">
          <header className="top-header">
            <div className="header-title">
              <h1>Monitoramento de Convênios</h1>
            </div>
            <div className="header-actions">
              <HelpCircle size={28} color="#002B5E" style={{cursor: 'pointer'}} />
              
              <div className="update-badge">
                <span>Última atualização:</span>
                <strong>{dataAtualizacao || "Sem dados"}</strong>
              </div>

              <input 
                type="file" 
                accept=".xlsx, .xls" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleImport}
              />
              <button className="btn-import" onClick={() => fileInputRef.current.click()}>
                <UploadCloud size={18} /> Importar Planilha
              </button>
            </div>
          </header>

          <div className="page-content">
            <Routes>
              <Route path="/" element={<DashboardInicio dados={dadosPlanilha} />} />
              <Route path="/execucao" element={<DashboardExecucao dados={dadosPlanilha} />} />
              <Route path="/mapa" element={<DashboardMapa dados={dadosPlanilha} />} />
              <Route path="/prazos" element={<DashboardPrazos dados={dadosPlanilha} />} />
            </Routes>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}