import React, { useState, useMemo } from 'react';
import { AlertTriangle, Hourglass, Clock, CalendarDays, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, LabelList } from 'recharts';

export default function DashboardPrazos({ dados }) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const dadosComPrazos = useMemo(() => {
    const hoje = new Date();
    
    return dados.map(row => {
      let statusPrazo = "Sem data";
      let dias = null;
      let cor = "#95A5A6";

      if (row['Fim Vigência']) {
        const dataFim = new Date(row['Fim Vigência']);
        const diffTime = dataFim - hoje;
        dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dias < 0) {
          statusPrazo = "Vencido";
          cor = "#E74C3C";
        } else if (dias <= 30) {
          statusPrazo = "Vencem em 30 dias";
          cor = "#F1C40F";
        } else if (dias <= 90) {
          statusPrazo = "Vencem em 90 dias";
          cor = "#2ECC71";
        } else {
          statusPrazo = "Vencem em 120 dias+";
          cor = "#3498DB";
        }
      }

      return {
        ...row,
        diasRestantes: dias,
        statusPrazo,
        corStatus: cor,
        dataFimFormatada: row['Fim Vigência'] ? new Date(row['Fim Vigência']).toLocaleDateString('pt-BR') : 'N/A'
      };
    }).filter(row => row.statusPrazo !== "Sem data"); 
  }, [dados]);

  const metricas = useMemo(() => {
    const contagem = {
      "Vencido": 0, "Vencem em 30 dias": 0, "Vencem em 90 dias": 0, "Vencem em 120 dias+": 0
    };
    
    const contagemMunicipio = {};

    dadosComPrazos.forEach(d => {
      contagem[d.statusPrazo] = (contagem[d.statusPrazo] || 0) + 1;
      
      const mun = d['Município Convenente'] || 'Não informado';
      contagemMunicipio[mun] = (contagemMunicipio[mun] || 0) + 1;
    });

    const dadosRosca = [
      { name: "Vencido", valor: contagem["Vencido"], fill: "#E74C3C" },
      { name: "Vencem em 30 dias", valor: contagem["Vencem em 30 dias"], fill: "#F1C40F" },
      { name: "Vencem em 90 dias", valor: contagem["Vencem em 90 dias"], fill: "#2ECC71" },
      { name: "Vencem em 120 dias+", valor: contagem["Vencem em 120 dias+"], fill: "#3498DB" }
    ];

    const dadosBarras = Object.keys(contagemMunicipio)
      .map(k => ({ name: k, valor: contagemMunicipio[k] }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    return { 
      totais: contagem, 
      dadosRosca, 
      dadosBarras,
      totalGeral: dadosComPrazos.length 
    };
  }, [dadosComPrazos]);

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensAtuais = dadosComPrazos.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(dadosComPrazos.length / itensPorPagina);

  return (
    <div className="prazos-container">
      
      <div className="prazos-header">
        <h2>Gestão de Vigência & Prazos</h2>
        <p>Acompanhe os prazos de vigência dos instrumentos de forma clara e objetiva.</p>
      </div>

      <div className="prazos-kpis">
        <div className="prazos-kpi-card" style={{ borderLeftColor: '#E74C3C' }}>
          <div className="prazos-kpi-icon" style={{ background: '#fceced', color: '#E74C3C' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="prazos-kpi-content">
            <h4>Vencidos</h4>
            <p>Convênios já vencidos e fora do prazo.</p>
            <strong>{metricas.totais["Vencido"]} <span>convênios</span></strong>
          </div>
        </div>
        
        <div className="prazos-kpi-card" style={{ borderLeftColor: '#F1C40F' }}>
          <div className="prazos-kpi-icon" style={{ background: '#fef9e7', color: '#F1C40F' }}>
            <Hourglass size={24} />
          </div>
          <div className="prazos-kpi-content">
            <h4>Vencem em 30 dias</h4>
            <p>Convênios com vencimento nos próximos 30 dias.</p>
            <strong>{metricas.totais["Vencem em 30 dias"]} <span>convênios</span></strong>
          </div>
        </div>

        <div className="prazos-kpi-card" style={{ borderLeftColor: '#2ECC71' }}>
          <div className="prazos-kpi-icon" style={{ background: '#eafaf1', color: '#2ECC71' }}>
            <Clock size={24} />
          </div>
          <div className="prazos-kpi-content">
            <h4>Vencem em 90 dias</h4>
            <p>Convênios com vencimento entre 31 e 90 dias.</p>
            <strong>{metricas.totais["Vencem em 90 dias"]} <span>convênios</span></strong>
          </div>
        </div>

        <div className="prazos-kpi-card" style={{ borderLeftColor: '#3498DB' }}>
          <div className="prazos-kpi-icon" style={{ background: '#ebf5fb', color: '#3498DB' }}>
            <CalendarDays size={24} />
          </div>
          <div className="prazos-kpi-content">
            <h4>Vencem em 120 dias+</h4>
            <p>Convênios com vencimento acima de 90 dias.</p>
            <strong>{metricas.totais["Vencem em 120 dias+"]} <span>convênios</span></strong>
          </div>
        </div>
      </div>

      <div className="prazos-content-grid">
        
        <div className="prazos-charts-col">
          <div className="prazos-box" style={{height: '280px', display: 'flex', flexDirection: 'column'}}>
            <h3>Distribuição por Status (Não Acumulativo)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metricas.dadosRosca} dataKey="valor" innerRadius={60} outerRadius={90}>
                  {metricas.dadosRosca.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="prazos-box" style={{height: '280px', display: 'flex', flexDirection: 'column'}}>
            <h3>Distribuição por Município</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.dadosBarras} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="valor" fill="#002B5E" barSize={16} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="valor" position="right" fill="#333" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="prazos-box" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Convênios por Prazo</h3>
          
          <div className="prazos-table-wrap" style={{flex: 1}}>
            <table className="prazos-table">
              <thead>
                <tr>
                  <th style={{width: '30px'}}></th>
                  <th>Instrumento</th>
                  <th>Convenente</th>
                  <th>Município</th>
                  <th>Fim de Vigência</th>
                  <th style={{textAlign: 'center'}}>Dias</th>
                  <th>Status</th>
                  <th>Processo</th>
                </tr>
              </thead>
              <tbody>
                {itensAtuais.map((item, idx) => (
                  <tr key={idx}>
                    <td><FileText size={16} color="#004b87" /></td>
                    <td><strong>{item['Instrumento']}</strong></td>
                    <td style={{fontSize: '11px'}}>{item['Nome Convenente']}</td>
                    <td>{item['Município Convenente']}</td>
                    <td>{item.dataFimFormatada}</td>
                    <td style={{textAlign: 'center', color: item.diasRestantes < 0 ? '#E74C3C' : '#333', fontWeight: 600}}>
                      {item.diasRestantes}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: `${item.corStatus}20`, color: item.corStatus }}>
                        {item.statusPrazo}
                      </span>
                    </td>
                    <td>{item['Processo']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prazos-pagination">
            <span>Mostrando {indexPrimeiroItem + 1} a {Math.min(indexUltimoItem, dadosComPrazos.length)} de {dadosComPrazos.length} convênios</span>
            <div className="prazos-pagination-controls">
              <button className="page-btn" disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)}>&lt;</button>
              
              {[...Array(Math.min(5, totalPaginas))].map((_, i) => {
                const num = i + 1;
                return (
                  <button key={num} className={`page-btn ${paginaAtual === num ? 'active' : ''}`} onClick={() => setPaginaAtual(num)}>
                    {num}
                  </button>
                );
              })}
              
              <button className="page-btn" disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)}>&gt;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}