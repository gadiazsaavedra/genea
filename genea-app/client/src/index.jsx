import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si deseas que tu aplicación funcione sin conexión y se cargue más rápido, puedes cambiar
// unregister() a register() a continuación. Ten en cuenta que esto conlleva algunas advertencias.
// Obtén más información sobre los service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// Si deseas comenzar a medir el rendimiento en tu aplicación, pasa una función
// para registrar los resultados (por ejemplo: reportWebVitals(console.log))
// o envía a un punto de análisis. Obtén más información: https://bit.ly/CRA-vitals
reportWebVitals();