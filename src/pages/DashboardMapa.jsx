import React, { useState, useMemo } from 'react';
import { HelpCircle } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { formatBillion } from '../utils/dataProcessor';

const COORDENADAS_MUNICIPIOS = {
  "RECIFE": { lat: -8.0476, lng: -34.8770 },
  "PETROLINA": { lat: -9.3891, lng: -40.5027 },
  "ARARIPINA": { lat: -7.5742, lng: -40.4603 },
  "CARUARU": { lat: -8.2833, lng: -35.9761 },
  "JABOATÃO DOS GUARARAPES": { lat: -8.1159, lng: -35.0154 },
  "GARANHUNS": { lat: -8.8828, lng: -36.4967 },
  "MORENO": { lat: -8.1191, lng: -35.0931 },
  "VITÓRIA DE SANTO ANTÃO": { lat: -8.1193, lng: -35.2956 },
  "OROBÓ": { lat: -7.7342, lng: -35.6006 },
  "OLINDA": { lat: -7.9906, lng: -34.8417 },
  "PESQUEIRA": { lat: -8.3578, lng: -36.6964 },
  "ARCOVERDE": { lat: -8.4183, lng: -37.0544 },
  "PALMARES": { lat: -8.6833, lng: -35.5917 },
  "SURUBIM": { lat: -7.8333, lng: -35.7531 },
  "BEZERROS": { lat: -8.2336, lng: -35.7958 },
  "OURICURI": { lat: -7.8825, lng: -40.0817 },
  "SÃO LOURENÇO DA MATA": { lat: -8.0017, lng: -35.0183 },
  "BUÍQUE": { lat: -8.6231, lng: -37.1558 }
};

export default function DashboardMapa({ dados }) {
  const [cidadeSelecionada, setCidadeSelecionada] = useState('Todos');

  const opcoesMunicipios = useMemo(() => {
    return [...new Set(dados.map(d => d['Município Convenente']).filter(Boolean))].sort();
  }, [dados]);

  const { dadosFiltrados, indicadores, dadosMapa } = useMemo(() => {
    let valorGlobal = 0;
    let valorPago = 0;
    const contagemPorCidade = {};
    const municipiosValidos = new Set();

    const dadosFiltrados = dados.filter(row => {
      if (cidadeSelecionada !== 'Todos' && row['Município Convenente'] !== cidadeSelecionada) return false;
      return true;
    });

    dadosFiltrados.forEach(row => {
      valorGlobal += Number(row['Valor Global']) || 0;
      valorPago += Number(row['Valor Pago']) || 0;
      
      const cidade = row['Município Convenente'];
      if (cidade) {
        municipiosValidos.add(cidade);
        contagemPorCidade[cidade] = (contagemPorCidade[cidade] || 0) + 1;
      }
    });

    const pontosMapa = Object.keys(contagemPorCidade).map(cidade => {
      const coord = COORDENADAS_MUNICIPIOS[cidade];
      if (!coord) return null; 

      return {
        cidade,
        convênios: contagemPorCidade[cidade],
        ...coord
      };
    }).filter(Boolean); 

    return {
      dadosFiltrados,
      dadosMapa: pontosMapa,
      indicadores: {
        totalConvenios: dadosFiltrados.length,
        valorGlobal: formatBillion(valorGlobal),
        valorPago: formatBillion(valorPago),
        totalMunicipios: municipiosValidos.size
      }
    };
  }, [dados, cidadeSelecionada]);

  const mapCenter = [-8.0, -37.0];

  return (
    <div className="mapa-container">
      
      <div className="mapa-header">
        <h2>Análise Regional & Municípios</h2>
        
        <div className="mapa-filter">
          <label>Município Convenente</label>
          <select 
            value={cidadeSelecionada} 
            onChange={(e) => setCidadeSelecionada(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {opcoesMunicipios.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <HelpCircle size={24} color="#002B5E" style={{cursor: 'pointer', marginLeft: '10px'}} />
        </div>
      </div>

      <div className="mapa-kpis">
        <div className="mapa-kpi-card">
          <div className="mapa-kpi-title">Convênios</div>
          <div className="mapa-kpi-value">{indicadores.totalConvenios}</div>
        </div>
        <div className="mapa-kpi-card">
          <div className="mapa-kpi-title">Valor Global</div>
          <div className="mapa-kpi-value">{indicadores.valorGlobal}</div>
        </div>
        <div className="mapa-kpi-card">
          <div className="mapa-kpi-title">Valor Pago</div>
          <div className="mapa-kpi-value">{indicadores.valorPago}</div>
        </div>
        <div className="mapa-kpi-card">
          <div className="mapa-kpi-title">Municípios</div>
          <div className="mapa-kpi-value">{indicadores.totalMunicipios}</div>
        </div>
      </div>

      <div className="map-box">
        <MapContainer center={mapCenter} zoom={7} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {dadosMapa.map((ponto, index) => (
            <CircleMarker
              key={index}
              center={[ponto.lat, ponto.lng]}
              radius={Math.min(10 + (ponto.convênios * 2), 40)} 
              fillColor="#0078D4"
              color="#004b87"
              weight={1}
              fillOpacity={0.6}
            >
              <Tooltip>
                <div style={{ textAlign: 'center' }}>
                  <strong>{ponto.cidade}</strong><br/>
                  {ponto.convênios} Convênio(s)
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}