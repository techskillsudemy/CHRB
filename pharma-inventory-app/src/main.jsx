import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { seedIfEmpty } from './services/seed.js'

// Seed localStorage on first launch
seedIfEmpty()

// One-time migration: clean old movements without lot tracking & init lots store
if (!localStorage.getItem('depot_lots_migrated')) {
  localStorage.setItem('depot_mouvements', JSON.stringify([]))
  localStorage.setItem('depot_lots', JSON.stringify([]))
  localStorage.setItem('depot_lots_migrated', '1')
  console.log('🔄 Migration: mouvements & lots nettoyés')
}

// One-time migration: remove product-level date_expiration & reset stock to 0
if (!localStorage.getItem('depot_products_cleaned')) {
  const raw = localStorage.getItem('depot_produits')
  if (raw) {
    const prods = JSON.parse(raw).map(p => {
      const { date_expiration, ...rest } = p
      return { ...rest, stock_theorique: 0 }
    })
    localStorage.setItem('depot_produits', JSON.stringify(prods))
  }
  localStorage.setItem('depot_mouvements', JSON.stringify([]))
  localStorage.setItem('depot_lots', JSON.stringify([]))
  localStorage.setItem('depot_products_cleaned', '1')
  console.log('🔄 Migration: produits nettoyés (date_expiration supprimé, stock → 0)')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
