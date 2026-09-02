import React, { useState, useMemo } from 'react';
import { Filter, FileText, FileSpreadsheet, FileCode, CheckCircle, FileWarning, Search, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function DashboardExecucao({ dados }) {
  const [filtros, setFiltros] = useState({
    instrumento: 'Todos',
    rap: 'Todos',
    planilha: 'Todos',
    nt: 'Todos',
    rff: 'Todos',
    pm: 'Todos',
    pf: 'Todos',
    tce: 'Todos'
  });

  const opcoesFiltro = useMemo(() => {
    const getUniqueValues = (coluna) => {
      return [...new Set(dados.map(d => String(d[coluna] || '')).filter(v => v.trim() !== ''))].sort();
    };

    return {
      instrumentos: getUniqueValues('Instrumento'),
      rap: getUniqueValues('RAP'),
      planilha: getUniqueValues('PLANILHA'),
      nt: getUniqueValues('NT'),
      rff: getUniqueValues('RELATÓRIO DE ACOMPANHAMENTO'),
      pm: getUniqueValues('PARECER DE OBJETIVOS'),
      pf: getUniqueValues('PARECER FINANCEIRO'),
      tce: getUniqueValues('TCE')
    };
  }, [dados]);

  const dadosFiltrados = useMemo(() => {
    return dados.filter(row => {
      if (filtros.instrumento !== 'Todos' && String(row['Instrumento'] || '') !== filtros.instrumento) return false;
      if (filtros.rap !== 'Todos' && String(row['RAP'] || '') !== filtros.rap) return false;
      if (filtros.planilha !== 'Todos' && String(row['PLANILHA'] || '') !== filtros.planilha) return false;
      if (filtros.nt !== 'Todos' && String(row['NT'] || '') !== filtros.nt) return false;
      if (filtros.rff !== 'Todos' && String(row['RELATÓRIO DE ACOMPANHAMENTO'] || '') !== filtros.rff) return false;
      if (filtros.pm !== 'Todos' && String(row['PARECER DE OBJETIVOS'] || '') !== filtros.pm) return false;
      if (filtros.pf !== 'Todos' && String(row['PARECER FINANCEIRO'] || '') !== filtros.pf) return false;
      if (filtros.tce !== 'Todos' && String(row['TCE'] || '') !== filtros.tce) return false;
      return true;
    });
  }, [dados, filtros]);

  const indicadores = useMemo(() => {
    const countValidos = (coluna) => {
      return dadosFiltrados.filter(d => d[coluna] !== null && d[coluna] !== undefined && String(d[coluna]).trim() !== '').length;
    };

    return {
      total: dadosFiltrados.length,
      rap: countValidos('RAP'),
      planilha: countValidos('PLANILHA'),
      nt: countValidos('NT'),
      rff: countValidos('RELATÓRIO DE ACOMPANHAMENTO'),
      pm: countValidos('PARECER DE OBJETIVOS'),
      pf: countValidos('PARECER FINANCEIRO')
    };
  }, [dadosFiltrados]);

  const chartData = [
    { name: 'Execução (%)', labelLong: 'Total de Convênios', valor: indicadores.total, color: '#2CA02C' },
    { name: 'RAP', labelLong: 'RAP (Restos a Pagar)', valor: indicadores.rap, color: '#D62728' },
    { name: 'Planilha', labelLong: 'Planilha', valor: indicadores.planilha, color: '#FF7F0E' },
    { name: 'NT', labelLong: 'NT (Nota Técnica)', valor: indicadores.nt, color: '#1F77B4' },
    { name: 'RFF', labelLong: 'RFF (Relatório Físico Financeiro)', valor: indicadores.rff, color: '#17BECF' },
    { name: 'PM', labelLong: 'PM (Parecer de Mérito)', valor: indicadores.pm, color: '#9467BD' },
    { name: 'PF', labelLong: 'PF (Parecer Financeiro)', valor: indicadores.pf, color: '#FF9896' },
  ];

  const limparFiltros = () => {
    setFiltros({
      instrumento: 'Todos', rap: 'Todos', planilha: 'Todos', nt: 'Todos', rff: 'Todos', pm: 'Todos', pf: 'Todos', tce: 'Todos'
    });
  };

  return (
    <div className="execucao-container">
      
      {/* Barra Lateral de Filtros */}
      <aside className="filter-sidebar">
        <div className="filter-header">
          <h3><Filter size={16} /> FILTROS</h3>
        </div>
        
        <div className="filter-group">
          <label>Instrumento / Convênio</label>
          <select value={filtros.instrumento} onChange={e => setFiltros({...filtros, instrumento: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.instrumentos.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>RAP</label>
          <select value={filtros.rap} onChange={e => setFiltros({...filtros, rap: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.rap.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Planilha</label>
          <select value={filtros.planilha} onChange={e => setFiltros({...filtros, planilha: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.planilha.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>NT (Nota Técnica)</label>
          <select value={filtros.nt} onChange={e => setFiltros({...filtros, nt: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.nt.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>RFF (Relatório Fís. Fin.)</label>
          <select value={filtros.rff} onChange={e => setFiltros({...filtros, rff: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.rff.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>PM (Parecer de Objetivos)</label>
          <select value={filtros.pm} onChange={e => setFiltros({...filtros, pm: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.pm.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>PF (Parecer Financeiro)</label>
          <select value={filtros.pf} onChange={e => setFiltros({...filtros, pf: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.pf.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>TCE</label>
          <select value={filtros.tce} onChange={e => setFiltros({...filtros, tce: e.target.value})}>
            <option value="Todos">Todos</option>
            {opcoesFiltro.tce.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        <button className="btn-limpar" onClick={limparFiltros}>
          Limpar filtros
        </button>
      </aside>

      <main className="execucao-content">
        
        <div className="kpi-row">
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#e8f5e9', color: '#2e7d32'}}><FileText size={20}/></div>
            <span className="kpi-exec-label">Total de<br/>Convênios</span>
            <span className="kpi-exec-value" style={{color: '#2CA02C'}}>{indicadores.total}</span>
          </div>
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#ffebee', color: '#c62828'}}><Search size={20}/></div>
            <span className="kpi-exec-label">Com RAP</span>
            <span className="kpi-exec-value" style={{color: '#D62728'}}>{indicadores.rap}</span>
          </div>
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#fff3e0', color: '#ef6c00'}}><FileSpreadsheet size={20}/></div>
            <span className="kpi-exec-label">Com Planilha</span>
            <span className="kpi-exec-value" style={{color: '#FF7F0E'}}>{indicadores.planilha}</span>
          </div>
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#e3f2fd', color: '#1565c0'}}><FileCode size={20}/></div>
            <span className="kpi-exec-label">Com NT</span>
            <span className="kpi-exec-value" style={{color: '#1F77B4'}}>{indicadores.nt}</span>
          </div>
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#e0f7fa', color: '#00838f'}}><FileText size={20}/></div>
            <span className="kpi-exec-label">Com RFF</span>
            <span className="kpi-exec-value" style={{color: '#17BECF'}}>{indicadores.rff}</span>
          </div>
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#f3e5f5', color: '#6a1b9a'}}><CheckCircle size={20}/></div>
            <span className="kpi-exec-label">Com PM</span>
            <span className="kpi-exec-value" style={{color: '#9467BD'}}>{indicadores.pm}</span>
          </div>
          <div className="kpi-exec-card">
            <div className="kpi-exec-icon" style={{background: '#fce4ec', color: '#ad1457'}}><FileWarning size={20}/></div>
            <span className="kpi-exec-label">Com PF</span>
            <span className="kpi-exec-value" style={{color: '#FF9896'}}>{indicadores.pf}</span>
          </div>
        </div>

        <div className="chart-section">
          <h3>Situação dos Convênios por Etapa</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#666', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#999', fontSize: 12}} 
                label={{ value: 'Qtd de convênios', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 12 }}
              />
              <RechartsTooltip 
                cursor={{fill: '#f9f9f9'}}
                formatter={(value, name, props) => [value, props.payload.labelLong]}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={50}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="valor" position="top" fill="#333" fontWeight="bold" fontSize={14} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="info-box">
          <AlertCircle size={24} color="#004b87" style={{flexShrink: 0}} />
          <div>
            <strong>Nota Técnica e Análise Financeira:</strong> A contagem de etapas técnicas e os agrupamentos de filtros refletem estritamente os registros preenchidos na base de dados (células válidas), ignorando valores vazios ou pendentes.
          </div>
        </div>

      </main>
    </div>
  );
}