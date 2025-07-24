import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './FamilyTree.css';

const FamilyTree = ({ data, onPersonClick, viewType = 'horizontal' }) => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  
  useEffect(() => {
    if (!data) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Configuración del árbol
    const width = 1000;
    const height = 600;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    
    // Crear jerarquía
    const root = d3.hierarchy(data);
    
    // Definir layout según el tipo de vista
    let treeLayout;
    if (viewType === 'vertical') {
      treeLayout = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    } else {
      treeLayout = d3.tree()
        .size([height - margin.top - margin.bottom, width - margin.right - margin.left]);
    }
    
    // Aplicar layout
    treeLayout(root);
    
    // Crear contenedor con zoom
    const g = svg.append("g")
      .attr("class", "tree-container")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Enlaces
    const linkGenerator = viewType === 'vertical'
      ? d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y)
      : d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x);
    
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", linkGenerator);
    
    // Nodos
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => {
        if (viewType === 'vertical') {
          return `translate(${d.x},${d.y})`;
        } else {
          return `translate(${d.y},${d.x})`;
        }
      })
      .on("click", (event, d) => {
        // Manejar clic en nodo
        setSelectedNode(d);
        if (onPersonClick) {
          onPersonClick(d.data);
        }
      });
    
    // Círculos para los nodos
    node.append("circle")
      .attr("r", 10)
      .attr("class", d => selectedNode && d.data._id === selectedNode.data._id ? "selected" : "");
    
    // Texto para los nodos
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => {
        if (viewType === 'vertical') {
          return 0;
        } else {
          return d.children ? -12 : 12;
        }
      })
      .attr("y", d => {
        if (viewType === 'vertical') {
          return d.children ? 20 : -20;
        } else {
          return 0;
        }
      })
      .style("text-anchor", d => {
        if (viewType === 'vertical') {
          return "middle";
        } else {
          return d.children ? "end" : "start";
        }
      })
      .text(d => d.data.fullName || d.data.name);
    
    // Zoom y pan
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    // Inicializar zoom
    svg.call(zoom);
    
    // Centrar el árbol inicialmente
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8);
    
    svg.call(zoom.transform, initialTransform);
    
    // Añadir gestos táctiles para dispositivos móviles
    if ('ontouchstart' in window) {
      svg.on('touchstart', function(event) {
        event.preventDefault();
      });
    }
    
  }, [data, onPersonClick, selectedNode, viewType]);
  
  return (
    <div className="family-tree-container">
      <div className="tree-controls">
        <button className="tree-control-btn" title="Acercar">
          <span>+</span>
        </button>
        <button className="tree-control-btn" title="Alejar">
          <span>-</span>
        </button>
        <button className="tree-control-btn" title="Centrar">
          <span>⌂</span>
        </button>
      </div>
      <svg ref={svgRef} width="100%" height="600"></svg>
    </div>
  );
};

export default FamilyTree;