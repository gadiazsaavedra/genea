import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FamilyTree from '../../components/FamilyTree/FamilyTree';
import PersonDetail from '../../components/PersonDetail/PersonDetail';
import personService from '../../services/personService';
import './TreeView.css';

const TreeView = () => {
  const { familyId } = useParams();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [viewType, setViewType] = useState('horizontal');
  const [generations, setGenerations] = useState(3);
  const [includeSpouses, setIncludeSpouses] = useState(true);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar datos reales desde la API
        try {
          // Obtener el ID de la persona raíz para esta familia
          // Esto podría requerir una llamada adicional a la API para obtener el fundador de la familia
          const rootPersonId = '1'; // Esto debería venir de la API
          
          const response = await personService.getPersonTree(rootPersonId, {
            generations,
            includeSpouses
          });
          
          if (response.success && response.data) {
            setTreeData(response.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('Error al cargar datos de la API, usando datos de ejemplo:', apiError);
        }
        
        // Si falla la API, usar datos de ejemplo
        setTimeout(() => {
          const mockData = {
            _id: '1',
            name: 'Juan Pérez',
            fullName: 'Juan Pérez',
            birthDate: '1950-05-15',
            isAlive: true,
            children: [
              {
                _id: '2',
                name: 'María Pérez',
                fullName: 'María Pérez',
                birthDate: '1975-08-20',
                isAlive: true,
                children: [
                  {
                    _id: '4',
                    name: 'Carlos Gómez',
                    fullName: 'Carlos Gómez',
                    birthDate: '2000-03-10',
                    isAlive: true
                  },
                  {
                    _id: '5',
                    name: 'Laura Gómez',
                    fullName: 'Laura Gómez',
                    birthDate: '2002-11-05',
                    isAlive: true
                  }
                ]
              },
              {
                _id: '3',
                name: 'Pedro Pérez',
                fullName: 'Pedro Pérez',
                birthDate: '1978-12-03',
                isAlive: true,
                children: [
                  {
                    _id: '6',
                    name: 'Ana Pérez',
                    fullName: 'Ana Pérez',
                    birthDate: '2005-07-22',
                    isAlive: true
                  }
                ]
              }
            ]
          };
          setTreeData(mockData);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Error al cargar los datos del árbol genealógico');
        setLoading(false);
        console.error('Error fetching tree data:', err);
      }
    };

    fetchTreeData();
  }, [familyId, generations, includeSpouses]);

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const handleCloseDetail = () => {
    setSelectedPerson(null);
  };
  
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };
  
  const handleGenerationsChange = (e) => {
    setGenerations(parseInt(e.target.value));
  };
  
  const handleIncludeSpousesChange = () => {
    setIncludeSpouses(!includeSpouses);
  };
  
  const handleExportTree = () => {
    // Implementar exportación del árbol (GEDCOM, PDF, etc.)
    alert('Funcionalidad de exportación en desarrollo');
  };

  if (loading) {
    return <div className="loading-container">Cargando árbol genealógico...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="tree-view-container">
      <div className="tree-header">
        <h1>Árbol Genealógico</h1>
        <div className="tree-options">
          <div className="view-type-selector">
            <button 
              className={`view-type-btn ${viewType === 'horizontal' ? 'active' : ''}`}
              onClick={() => handleViewTypeChange('horizontal')}
              title="Vista horizontal"
            >
              ↔️
            </button>
            <button 
              className={`view-type-btn ${viewType === 'vertical' ? 'active' : ''}`}
              onClick={() => handleViewTypeChange('vertical')}
              title="Vista vertical"
            >
              ↕️
            </button>
          </div>
          
          <div className="generations-selector">
            <label htmlFor="generations">Generaciones:</label>
            <select 
              id="generations" 
              value={generations} 
              onChange={handleGenerationsChange}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          
          <div className="spouses-selector">
            <input 
              type="checkbox" 
              id="includeSpouses" 
              checked={includeSpouses} 
              onChange={handleIncludeSpousesChange}
            />
            <label htmlFor="includeSpouses">Incluir cónyuges</label>
          </div>
        </div>
        
        <div className="tree-actions">
          <button className="btn btn-outline" onClick={handleExportTree}>Exportar árbol</button>
          <button className="btn btn-primary">Añadir persona</button>
        </div>
      </div>
      
      <div className="tree-visualization">
        <FamilyTree 
          data={treeData} 
          onPersonClick={handlePersonClick}
          viewType={viewType}
        />
      </div>
      
      {selectedPerson && (
        <div className="person-detail-overlay">
          <div className="person-detail-container">
            <PersonDetail 
              person={selectedPerson} 
              onClose={handleCloseDetail} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeView;