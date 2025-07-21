import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, CircularProgress, Paper, IconButton, Slider, ButtonGroup, Button } from '@mui/material';
import { ZoomIn, ZoomOut, FilterList, PanTool } from '@mui/icons-material';

// Interfaces para los datos
interface Person {
  _id: string;
  fullName: string;
  birthDate?: Date;
  deathDate?: Date;
  profilePhoto?: string;
  isAlive: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  profilePhoto?: string;
  isAlive: boolean;
  children?: TreeNode[];
  spouses?: {
    id: string;
    name: string;
    birthYear?: number;
    deathYear?: number;
    profilePhoto?: string;
    isAlive: boolean;
  }[];
}

interface FamilyTreeVisualizationProps {
  data: TreeNode | null;
  loading: boolean;
  error: string | null;
  onPersonClick: (personId: string) => void;
  filters?: {
    showOnlyLiving?: boolean;
    showOnlyDirect?: boolean;
    generationLimit?: number;
  };
}

const FamilyTreeVisualization: React.FC<FamilyTreeVisualizationProps> = ({
  data,
  loading,
  error,
  onPersonClick,
  filters = {}
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Función para actualizar las dimensiones del SVG
  const updateDimensions = () => {
    if (svgRef.current) {
      const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
      setDimensions({
        width: containerWidth,
        height: Math.max(600, containerWidth * 0.75)
      });
    }
  };

  // Efecto para manejar el redimensionamiento
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Función para filtrar los datos según los filtros
  const filterData = (node: TreeNode): TreeNode => {
    if (!node) return node;
    
    // Copia profunda del nodo
    const filteredNode = { ...node };
    
    // Filtrar hijos
    if (filteredNode.children) {
      filteredNode.children = filteredNode.children
        .filter(child => {
          // Filtrar por personas vivas si es necesario
          if (localFilters.showOnlyLiving && !child.isAlive) {
            return false;
          }
          return true;
        })
        .map(child => filterData(child));
    }
    
    // Filtrar cónyuges
    if (filteredNode.spouses) {
      filteredNode.spouses = filteredNode.spouses
        .filter(spouse => {
          // Filtrar por personas vivas si es necesario
          if (localFilters.showOnlyLiving && !spouse.isAlive) {
            return false;
          }
          return true;
        });
    }
    
    return filteredNode;
  };

  // Efecto para renderizar el árbol cuando los datos cambian
  useEffect(() => {
    if (!data || loading || error) return;

    // Aplicar filtros a los datos
    const filteredData = filterData(data);

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Crear la jerarquía de datos
    const root = d3.hierarchy(filteredData);

    // Configurar el layout del árbol
    const treeLayout = d3.tree<TreeNode>()
      .size([dimensions.height - 100, dimensions.width - 200])
      .nodeSize([120, 200]); // Ajustar según necesidad

    // Aplicar el layout
    const treeData = treeLayout(root);

    // Crear el SVG
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${position.x + 100}, ${position.y + 50}) scale(${zoom})`);

    // Crear enlaces entre nodos
    svg.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5);

    // Crear los nodos
    const nodes = svg.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y}, ${d.x})`)
      .on('click', (event, d) => {
        onPersonClick(d.data.id);
      });

    // Agregar círculos para los nodos
    nodes.append('circle')
      .attr('r', 25)
      .attr('fill', d => d.data.isAlive ? '#4a6741' : '#8e7d5b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Agregar imágenes de perfil si están disponibles
    nodes.filter(d => d.data.profilePhoto)
      .append('image')
      .attr('xlink:href', d => d.data.profilePhoto)
      .attr('x', -20)
      .attr('y', -20)
      .attr('width', 40)
      .attr('height', 40)
      .attr('clip-path', 'circle(20px at center)');

    // Agregar texto para los nombres
    nodes.append('text')
      .attr('dy', 45)
      .attr('text-anchor', 'middle')
      .text(d => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', '#333');

    // Agregar años de nacimiento y muerte
    nodes.append('text')
      .attr('dy', 60)
      .attr('text-anchor', 'middle')
      .text(d => {
        if (d.data.birthYear) {
          return d.data.isAlive
            ? `n. ${d.data.birthYear}`
            : `${d.data.birthYear} - ${d.data.deathYear || '?'}`;
        }
        return '';
      })
      .attr('font-size', '10px')
      .attr('fill', '#666');

    // Implementar arrastre (drag)
    const dragHandler = d3.drag<SVGSVGElement, unknown>()
      .on('start', () => {
        setIsDragging(true);
      })
      .on('drag', (event) => {
        setPosition(prev => ({
          x: prev.x + event.dx / zoom,
          y: prev.y + event.dy / zoom
        }));
      })
      .on('end', () => {
        setIsDragging(false);
      });

    dragHandler(d3.select(svgRef.current) as any);

  }, [data, loading, error, dimensions, zoom, position, localFilters, onPersonClick]);

  // Funciones para controlar el zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  // Función para resetear la vista
  const handleResetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Función para actualizar filtros
  const handleFilterChange = (filterName: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No hay datos disponibles para mostrar.</Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        overflow: 'hidden', 
        p: 2, 
        backgroundColor: '#f9f9f5',
        borderRadius: 2,
        position: 'relative'
      }}
    >
      {/* Controles de zoom y filtros */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOut />
          </IconButton>
          <Slider
            value={zoom}
            min={0.5}
            max={3}
            step={0.1}
            onChange={handleZoomChange}
            sx={{ width: 100, mx: 2 }}
          />
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomIn />
          </IconButton>
        </Box>
        
        <ButtonGroup variant="outlined" size="small">
          <Button 
            startIcon={<FilterList />}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            Filtros
          </Button>
          <Button onClick={handleResetView}>
            Resetear vista
          </Button>
        </ButtonGroup>
      </Box>
      
      {/* Panel de filtros */}
      {showFilterPanel && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Filtros</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant={localFilters.showOnlyLiving ? "contained" : "outlined"}
              size="small"
              onClick={() => handleFilterChange('showOnlyLiving', !localFilters.showOnlyLiving)}
            >
              Solo personas vivas
            </Button>
            <Button
              variant={localFilters.showOnlyDirect ? "contained" : "outlined"}
              size="small"
              onClick={() => handleFilterChange('showOnlyDirect', !localFilters.showOnlyDirect)}
            >
              Solo línea directa
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Visualización del árbol */}
      <Box sx={{ 
        position: 'relative', 
        height: dimensions.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}>
        <svg 
          ref={svgRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            overflow: 'visible'
          }}
        />
      </Box>
    </Paper>
  );
};

export default FamilyTreeVisualization;