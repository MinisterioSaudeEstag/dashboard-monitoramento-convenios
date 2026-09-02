import React, { useMemo } from 'react';
import { formatBillion } from '../utils/dataProcessor';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardInicio({ dados }) {
  const indicadores = useMemo(() => {
    let valorGlobal = 0;
    let valorPago = 0;
    let valorRepasse = 0;
    const contagemSituacao = {};

    dados.forEach(row => {
      valorGlobal += Number(row['Valor Global']) || 0;
      valorPago += Number(row['Valor Pago']) || 0;
      valorRepasse += Number(row['Valor Repasse']) || 0;

      const sit = row['Situação'] || 'Sem situação';
      contagemSituacao[sit] = (contagemSituacao[sit] || 0) + 1;
    });

    const percentualExecucao = valorGlobal > 0 ? ((valorPago / valorGlobal) * 100).toFixed(2) : "0.00";

    const dadosSituacao = Object.keys(contagemSituacao).map(key => ({
      name: key,
      valor: contagemSituacao[key]
    })).sort((a, b) => b.valor - a.valor);

    return {
      execucao: percentualExecucao.replace('.', ','),
      valorGlobal: formatBillion(valorGlobal),
      valorPago: formatBillion(valorPago),
      valorRepasse: formatBillion(valorRepasse),
      dadosSituacao
    };
  }, [dados]);

  const COLORS = ['#0078D4', '#004b87', '#4CB9E7', '#B6E6FB', '#107C41', '#C4C4C4', '#8E44AD', '#E67E22'];

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', maxWidth: '300px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#002B5E' }}>{payload[0].payload.name}</p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>Qtd: <strong style={{color: '#0078D4'}}>{payload[0].value}</strong></p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalConv = indicadores.dadosSituacao.reduce((acc, curr) => acc + curr.valor, 0);
      const pct = totalConv > 0 ? ((data.valor / totalConv) * 100).toFixed(1) : 0;
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', maxWidth: '300px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#002B5E' }}>{data.name}</p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>Qtd: <strong>{data.valor}</strong> ({pct}%)</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '11px', color: '#666' }}>
        {payload.map((entry, index) => (
          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: entry.color, borderRadius: '50%', flexShrink: 0 }}></span>
            <span 
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }} 
              title={entry.value} 
            >
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const formatYAxis = (tickItem) => {
    if (tickItem.length > 25) {
      return tickItem.substring(0, 23) + "...";
    }
    return tickItem;
  };

  return (
    <div className="page-container">
      <h2 style={{ fontSize: '20px', color: '#002B5E', marginBottom: '-5px' }}>
        Valores & Andamento de Convênios
      </h2>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">% de Execução</div>
          <div className="kpi-body">{indicadores.execucao}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">Valor Global</div>
          <div className="kpi-body">{indicadores.valorGlobal}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">Valor Pago</div>
          <div className="kpi-body">{indicadores.valorPago}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">Valor Repasse</div>
          <div className="kpi-body">{indicadores.valorRepasse}</div>
        </div>
      </div>

      <div className="charts-grid">
        
        <div className="chart-box">
          <h3>Total Global por Situação</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={indicadores.dadosSituacao} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <XAxis type="number" hide />

              <YAxis 
                dataKey="name" 
                type="category" 
                width={180} 
                tick={{ fontSize: 11, fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={formatYAxis} 
              />
              <RechartsTooltip content={<CustomBarTooltip />} cursor={{fill: '#f5f5f5'}} />
              <Bar dataKey="valor" fill="#0078D4" barSize={20} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Convênios por Situação</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={indicadores.dadosSituacao}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="valor"
              >
                {indicadores.dadosSituacao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomPieTooltip />} />
              <Legend content={<CustomLegend />} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}