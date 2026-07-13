import React, { useEffect, useMemo, useState } from 'react'
import note2 from './assets/notes/2.png'
import note5 from './assets/notes/5.png'
import note10 from './assets/notes/10.png'
import note20 from './assets/notes/20.png'
import note50 from './assets/notes/50.png'
import note100 from './assets/notes/100.png'
import fundoImg from './assets/fundo/fundo.jpg'

const NOTES = [2,5,10,20,50,100]
const NOTE_MAP = {
  2: note2,
  5: note5,
  10: note10,
  20: note20,
  50: note50,
  100: note100,
}

export default function App(){
  const [valorUnitario, setValorUnitario] = useState(7.50)
  const [inputValor, setInputValor] = useState('7.50')
  const [editingValor, setEditingValor] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [selectedCounts, setSelectedCounts] = useState({})
  const [manualReceived, setManualReceived] = useState('')
  const [manualConfirmed, setManualConfirmed] = useState(false)
  const [focusedValor, setFocusedValor] = useState(false)
  const [focusedManual, setFocusedManual] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem('valorUnitario')
    if(saved){
      const num = parseFloat(saved)
      if(!isNaN(num)){
        setValorUnitario(num)
        setInputValor(num.toFixed(2))
      }
    }
  },[])

  const saveValor = ()=>{
    const num = parseFloat(inputValor.replace(',','.'))
    if(!isNaN(num) && num > 0){
      setValorUnitario(num)
      localStorage.setItem('valorUnitario', num.toString())
      setManualReceived('')
      setManualConfirmed(false)
      setSelectedCounts({})
      setEditingValor(false)
      setFocusedValor(false)
    }
  }

  const increment = ()=> setQuantidade(q => q+1)
  const decrement = ()=> setQuantidade(q => Math.max(1, q-1))
  const novoPedido = ()=>{
    setQuantidade(1)
    setSelectedCounts({})
    setManualReceived('')
    setManualConfirmed(false)
  }

  const clearNotesAndReceived = ()=>{
    setSelectedCounts({})
    setManualReceived('')
    setManualConfirmed(false)
  }

  const total = (valorUnitario * quantidade)

  const addNoteOne = (note)=>{
    setSelectedCounts(prev => {
      const key = note.toString()
      const next = {...prev}
      next[key] = (next[key] || 0) + 1
      return next
    })
    setManualReceived('')
    setManualConfirmed(false)
  }

  const removeNoteOne = (note)=>{
    setSelectedCounts(prev => {
      const key = note.toString()
      if(!prev[key]) return prev
      const next = {...prev}
      const newCount = Math.max(0, (next[key] || 0) - 1)
      if(newCount > 0) next[key] = newCount
      else delete next[key]
      return next
    })
    setManualConfirmed(false)
  }

  const selectedSum = useMemo(()=>{
    return Object.entries(selectedCounts).reduce((s,[k,v])=> s + parseFloat(k)*v, 0)
  },[selectedCounts])

  const receivedAmount = useMemo(()=>{
    const manual = parseFloat((manualReceived||'').toString().replace(',','.'))
    if(manualConfirmed && !isNaN(manual) && manual > 0) return manual
    return selectedSum
  },[manualReceived, manualConfirmed, selectedSum])

  const troco = useMemo(()=>{
    return parseFloat((receivedAmount - total).toFixed(2))
  },[receivedAmount, total])

  return (
    <div className="min-h-screen w-screen app-bg flex items-start justify-center">
      <div className="w-full max-w-[390px] mx-auto rounded-2xl shadow-lg p-4 border border-slate-300/40" style={{ backgroundColor: 'rgba(255,255,255,0.88)', backgroundImage: `url(${fundoImg})`, backgroundSize: '55% auto', backgroundPosition: 'center 35%', backgroundRepeat: 'no-repeat', backgroundAttachment: 'local' }}>
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Calculadora de Troco - Doces</h1>
          <p className="mt-2 text-sm text-slate-900">Toque nas notas para somar; ou digite o valor recebido.</p>
        </header>

        <section className="mb-4">
          <label className="block text-sm font-medium text-slate-900 bg-slate-950/20 px-2 py-1 rounded-md">Valor Unitário (R$)</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center input-group">
            <div className="relative input-with-button w-full">
              <input
                className="input-control pr-12"
                value={editingValor ? inputValor : valorUnitario.toFixed(2)}
                readOnly={!editingValor}
                onClick={()=> { setEditingValor(true); setFocusedValor(true) }}
                onFocus={()=>{ setEditingValor(true); setFocusedValor(true) }}
                onBlur={()=> {
                  setFocusedValor(false)
                  setEditingValor(false)
                  setInputValor(valorUnitario.toFixed(2))
                }}
                onChange={e=> setInputValor(e.target.value)}
                inputMode="decimal"
              />
              {editingValor && (
                <button onMouseDown={e => e.preventDefault()} onClick={saveValor} className="icon-button" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.975 7.974a1 1 0 01-1.414 0L3.296 9.667a1 1 0 011.414-1.414l3.057 3.057 7.268-7.268a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mb-4">
          <label className="block text-sm font-medium text-slate-900 bg-slate-950/20 px-2 py-1 rounded-md">Quantidade</label>
          <div className="mt-2 flex items-center gap-3">
            <button onClick={decrement} className="btn-large bg-red-400 text-white">-</button>
            <div className="text-xl font-medium min-w-[3rem] px-2 text-center flex items-center justify-center">{String(quantidade).padStart(2,'0')}</div>
            <button onClick={increment} className="btn-large bg-green-400 text-white">+</button>
            <button onClick={novoPedido} className="ml-auto bg-gray-200 px-3 py-2 rounded-lg">Limpar</button>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-900 bg-slate-950/20 px-2 py-1 rounded-md">Total</div>
            <div className="text-xl font-semibold text-white bg-slate-950/80 px-2 py-1 rounded-md">R$ {total.toFixed(2)}</div>
          </div>
        </section>

        <section className="mb-4">
          <div className="text-sm text-slate-900 mb-2 bg-slate-950/20 inline-block px-2 py-1 rounded-md">Dinheiro Recebido</div>
          <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:flex-wrap sm:items-center input-group">
            <div className="relative input-with-button flex-1 min-w-0">
              <input
                className="input-control pr-12 w-full"
                placeholder="Digite o valor recebido (ex: 50,00)"
                value={manualReceived}
                onFocus={()=> setFocusedManual(true)}
                onBlur={()=> setFocusedManual(false)}
                onChange={e=> {
                  const value = e.target.value
                  setManualReceived(value)
                  const manual = parseFloat(value.toString().replace(',','.'))
                  setManualConfirmed(!isNaN(manual) && manual > 0)
                  setSelectedCounts({})
                }}
                inputMode="decimal"
              />
              {focusedManual && (
                <button
                  type="button"
                  className="icon-button"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.975 7.974a1 1 0 01-1.414 0L3.296 9.667a1 1 0 011.414-1.414l3.057 3.057 7.268-7.268a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
              <div className="text-sm text-slate-900 sm:ml-2 bg-slate-950/20 px-2 py-1 rounded-md">ou</div>
            <div className="flex items-center gap-2 text-sm text-slate-900 font-medium bg-slate-950/20 px-2 py-1 rounded-md">
              Usar notas
              <button
                type="button"
                onClick={clearNotesAndReceived}
                className="text-xs font-semibold text-slate-900 bg-white/80 px-2 py-1 rounded-md shadow-sm"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {NOTES.map(n => {
              const key = n.toString()
              const count = selectedCounts[key] || 0
              const src = NOTE_MAP[n]
              return (
                <div key={key} className="note-card">
                  <img src={src} alt={`R$ ${n}`} className="note-image" />

                  <div
                    className="overlay-left"
                    onPointerDown={(e)=> e.preventDefault()}
                    onPointerUp={(e)=>{ e.stopPropagation(); removeNoteOne(n) }}
                    onPointerCancel={()=> {}}
                    onPointerLeave={()=> {}}
                  />
                  <div
                    className="overlay-right"
                    onPointerDown={(e)=> e.preventDefault()}
                    onPointerUp={(e)=>{ e.stopPropagation(); addNoteOne(n) }}
                    onPointerCancel={()=> {}}
                    onPointerLeave={()=> {}}
                  />

                  {count > 0 && <div className="note-count">{count}</div>}
                </div>
              )
            })}
          </div>

          <div className="mt-3 text-sm text-slate-900 bg-slate-950/20 inline-block px-2 py-1 rounded-md">Total recebido: <span className="font-semibold text-slate-900">R$ {receivedAmount.toFixed(2)}</span></div>
        </section>

        <section>
          <div className={`mt-2 text-3xl font-bold ${isNaN(troco) ? 'text-slate-900' : troco >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isNaN(troco)
              ? '—'
              : troco >= 0
                ? `Troco R$ ${troco.toFixed(2)}`
                : `Falta R$ ${Math.abs(troco).toFixed(2)}`}
          </div>
        </section>
      </div>
    </div>
  )
}
