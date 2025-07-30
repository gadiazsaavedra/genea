import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton, 
  IconButton, 
  Tooltip,
  Paper
} from '@mui/material';
import { 
  AccountTree, 
  Timeline, 
  DonutSmall, 
  ZoomIn, 
  ZoomOut, 
  CenterFocusStrong,
  Download
} from '@mui/icons-material';

const TreeVisualization = ({ familyData, onPersonClick }) => {
  const svgRef = useRef();
  const [viewType, setViewType] = useState('traditional');
  const [zoom, setZoom] = useState(1);

  // Configuraciones para diferentes tipos de vista
  const viewConfigs = {
    traditional: {
      nodeWidth: 200,
      nodeHeight: 80,
      levelHeight: 120,
      orientation: 'vertical'
    },
    timeline: {
      nodeWidth: 150,
      nodeHeight: 60,
      levelHeight: 100,
      orientation: 'horizontal'
    },
    circular: {
      radius: 300,
      nodeSize: 60,
      angleStep: 30
    },
    fan: {
      radius: 250,
      nodeSize: 50,
      angleRange: 180
    }
  };

  useEffect(() => {
    if (!familyData || familyData.length === 0) return;
    
    renderTree();
  }, [familyData, viewType, zoom]);

  const renderTree = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 800;
    
    svg.attr("width", width).attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height/2}) scale(${zoom})`);

    switch(viewType) {
      case 'traditional':
        renderTraditionalTree(g, width, height);
        break;
      case 'timeline':
        renderTimelineTree(g, width, height);
        break;
      case 'circular':
        renderCircularTree(g, width, height);
        break;
      case 'fan':
        renderFanTree(g, width, height);
        break;
    }
  };

  const renderTraditionalTree = (g, width, height) => {
    const config = viewConfigs.traditional;
    const hierarchy = d3.hierarchy(processDataForHierarchy(familyData));
    const treeLayout = d3.tree().size([width - 200, height - 200]);
    
    treeLayout(hierarchy);

    // Enlaces
    g.selectAll('.link')
      .data(hierarchy.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', 2);

    // Nodos
    const nodes = g.selectAll('.node')
      .data(hierarchy.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => onPersonClick && onPersonClick(d.data));

    // Rectángulos de nodos
    nodes.append('rect')
      .attr('width', config.nodeWidth)
      .attr('height', config.nodeHeight)
      .attr('x', -config.nodeWidth/2)
      .attr('y', -config.nodeHeight/2)
      .attr('rx', 8)
      .style('fill', d => d.data.gender === 'male' ? '#e3f2fd' : '#fce4ec')
      .style('stroke', d => d.data.gender === 'male' ? '#2196f3' : '#e91e63')
      .style('stroke-width', 2);

    // Fotos
    nodes.append('circle')
      .attr('r', 25)
      .attr('cy', -15)
      .style('fill', '#f5f5f5')
      .style('stroke', '#ddd');

    // Nombres
    nodes.append('text')
      .attr('dy', 10)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '12px')
      .text(d => `${d.data.first_name} ${d.data.last_name || ''}`);

    // Fechas
    nodes.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(d => {
        const birth = d.data.birth_date ? new Date(d.data.birth_date).getFullYear() : '?';
        const death = d.data.death_date ? new Date(d.data.death_date).getFullYear() : '';
        return death ? `${birth} - ${death}` : `${birth}`;
      });
  };

  const renderTimelineTree = (g, width, height) => {
    const sortedData = [...familyData].sort((a, b) => {
      const dateA = new Date(a.birth_date || '1900-01-01');
      const dateB = new Date(b.birth_date || '1900-01-01');
      return dateA - dateB;
    });

    const timeScale = d3.scaleTime()
      .domain(d3.extent(sortedData, d => new Date(d.birth_date || '1900-01-01')))
      .range([-width/2 + 100, width/2 - 100]);

    // Línea de tiempo
    g.append('line')
      .attr('x1', -width/2 + 100)
      .attr('x2', width/2 - 100)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', '#333')
      .style('stroke-width', 3);

    // Nodos en timeline
    const nodes = g.selectAll('.timeline-node')
      .data(sortedData)
      .enter()
      .append('g')
      .attr('class', 'timeline-node')
      .attr('transform', (d, i) => {
        const x = timeScale(new Date(d.birth_date || '1900-01-01'));
        const y = (i % 2 === 0) ? -80 : 80;
        return `translate(${x}, ${y})`;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => onPersonClick && onPersonClick(d));

    // Líneas conectoras
    nodes.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', d => d.birth_date && new Date(d.birth_date).getFullYear() % 2 === 0 ? 80 : -80)
      .style('stroke', '#666')
      .style('stroke-dasharray', '3,3');

    // Círculos de personas
    nodes.append('circle')
      .attr('r', 30)
      .style('fill', d => d.gender === 'male' ? '#2196f3' : '#e91e63')
      .style('opacity', 0.8);

    // Nombres
    nodes.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .style('font-size', '10px')
      .text(d => d.first_name);

    // Años
    nodes.append('text')
      .attr('dy', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d.birth_date ? new Date(d.birth_date).getFullYear() : '?');
  };

  const renderCircularTree = (g, width, height) => {
    const radius = 300;
    const angleStep = (2 * Math.PI) / familyData.length;

    const nodes = g.selectAll('.circular-node')
      .data(familyData)
      .enter()
      .append('g')
      .attr('class', 'circular-node')
      .attr('transform', (d, i) => {
        const angle = i * angleStep;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return `translate(${x}, ${y})`;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => onPersonClick && onPersonClick(d));

    // Círculo central
    g.append('circle')
      .attr('r', 50)
      .style('fill', '#f5f5f5')
      .style('stroke', '#ddd')
      .style('stroke-width', 2);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .style('font-weight', 'bold')
      .text('FAMILIA');

    // Nodos circulares
    nodes.append('circle')
      .attr('r', 25)
      .style('fill', d => d.gender === 'male' ? '#2196f3' : '#e91e63')
      .style('opacity', 0.8);

    nodes.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .style('font-size', '10px')
      .text(d => d.first_name);

    // Líneas al centro
    nodes.append('line')
      .attr('x1', 0)
      .attr('x2', (d, i) => {
        const angle = i * angleStep;
        return -Math.cos(angle) * (radius - 50);
      })
      .attr('y1', 0)
      .attr('y2', (d, i) => {
        const angle = i * angleStep;
        return -Math.sin(angle) * (radius - 50);
      })
      .style('stroke', '#ccc')
      .style('stroke-width', 1);
  };

  const renderFanTree = (g, width, height) => {
    const generations = groupByGeneration(familyData);
    const maxGen = Math.max(...Object.keys(generations).map(Number));
    
    Object.keys(generations).forEach(gen => {
      const genNum = parseInt(gen);
      const people = generations[gen];
      const radius = 100 + (genNum * 80);
      const angleRange = Math.PI; // 180 grados
      const angleStep = angleRange / (people.length + 1);

      people.forEach((person, i) => {
        const angle = -angleRange/2 + (i + 1) * angleStep;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const node = g.append('g')
          .attr('transform', `translate(${x}, ${y})`)
          .style('cursor', 'pointer')
          .on('click', () => onPersonClick && onPersonClick(person));

        node.append('circle')
          .attr('r', 20)
          .style('fill', person.gender === 'male' ? '#2196f3' : '#e91e63')
          .style('opacity', 0.8);

        node.append('text')
          .attr('dy', 5)
          .attr('text-anchor', 'middle')
          .style('fill', 'white')
          .style('font-size', '9px')
          .text(person.first_name);
      });
    });
  };

  const processDataForHierarchy = (data) => {
    // Convertir datos planos a estructura jerárquica
    // Esta es una implementación simplificada
    return {
      id: 'root',
      first_name: 'Familia',
      children: data.map(person => ({
        ...person,
        children: []
      }))
    };
  };

  const groupByGeneration = (data) => {
    // Agrupar por generación basado en fechas de nacimiento
    const generations = {};
    data.forEach(person => {
      const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : 2000;
      const generation = Math.floor((2024 - birthYear) / 25); // 25 años por generación
      if (!generations[generation]) generations[generation] = [];
      generations[generation].push(person);
    });
    return generations;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetZoom = () => setZoom(1);

  const exportSVG = () => {
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arbol-genealogico.svg';
    link.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(e, newView) => newView && setViewType(newView)}
          size="small"
        >
          <ToggleButton value="traditional">
            <Tooltip title="Vista Tradicional">
              <AccountTree />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="timeline">
            <Tooltip title="Línea de Tiempo">
              <Timeline />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="circular">
            <Tooltip title="Vista Circular">
              <DonutSmall />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="fan">
            <Tooltip title="Vista Abanico">
              <AccountTree style={{ transform: 'rotate(45deg)' }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Box>
          <Tooltip title="Acercar">
            <IconButton onClick={handleZoomIn}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alejar">
            <IconButton onClick={handleZoomOut}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Centrar">
            <IconButton onClick={handleResetZoom}>
              <CenterFocusStrong />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar SVG">
            <IconButton onClick={exportSVG}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ overflow: 'hidden', height: 'calc(100% - 60px)' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      </Box>
    </Paper>
  );
};

export default TreeVisualization;