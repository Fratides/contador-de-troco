import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  const [produtos, setProdutos] = useState([
    { id: 0, nome: 'Produto Padrão', valor: 7.50, quantidade: 1 }
  ])
  const [proximoId, setProximoId] = useState(1)
  const [editandoId, setEditandoId] = useState(null)
  const [editNome, setEditNome] = useState('')
  const [editValor, setEditValor] = useState('')
  const [produtoOriginal, setProdutoOriginal] = useState(null)
  const [selectedCounts, setSelectedCounts] = useState({})
  const [manualReceived, setManualReceived] = useState('')
  const [manualConfirmed, setManualConfirmed] = useState(false)
  const [focusedManual, setFocusedManual] = useState(false)
  const [resetClicked, setResetClicked] = useState(false)
  const [clearNotesClicked, setClearNotesClicked] = useState(false)
  const [addProductClicked, setAddProductClicked] = useState(false)
  const [clickedQuantityButtons, setClickedQuantityButtons] = useState({})
  const valorInputRef = useRef(null)

  const formatarValorManualParaExibir = (valorCentsStr) => {
    if (!valorCentsStr || valorCentsStr.length === 0) return ''
    const padded = valorCentsStr.padStart(3, '0')
    let inteiro = padded.slice(0, -2)
    const centavos = padded.slice(-2)
    inteiro = inteiro.replace(/^0+/, '') || '0'
    return `${inteiro},${centavos}`
  }

  useEffect(()=>{
    const saved = localStorage.getItem('produtos')
    if(saved){
      try {
        const parsed = JSON.parse(saved)
        if(Array.isArray(parsed) && parsed.length > 0) {
          setProdutos(parsed)
          const maxId = Math.max(...parsed.map(p => p.id || 0))
          setProximoId(maxId + 1)
        }
      } catch(e) {
        console.error('Erro ao carregar produtos:', e)
      }
    }
  },[])

  const salvarProdutosArmazenamento = (prods) => {
    localStorage.setItem('produtos', JSON.stringify(prods))
  }

  const editarProduto = (id, nome, valor) => {
    const valor_num = parseFloat(valor.replace(',','.'))
    if(nome.trim() && !isNaN(valor_num) && valor_num >= 0) {
      const novaProd = produtos.map(p => 
        p.id === id ? {...p, nome: nome.trim(), valor: valor_num} : p
      )
      setProdutos(novaProd)
      salvarProdutosArmazenamento(novaProd)
      setEditandoId(null)
      setEditNome('')
      setEditValor('')
      setProdutoOriginal(null)
    }
  }

  const iniciarEdicao = (id, nome, valor) => {
    const original = produtos.find(p => p.id === id)
    setProdutoOriginal(original)
    setEditandoId(id)
    setEditNome(nome)
    const valorCents = Math.round(valor * 100).toString()
    setEditValor(valorCents)
  }

  const formatarValorParaSalvar = (valorCentsStr) => {
    if (!valorCentsStr || valorCentsStr.length === 0) return '0.00'
    const padded = valorCentsStr.padStart(3, '0')
    const inteiro = padded.slice(0, -2)
    const centavos = padded.slice(-2)
    return `${inteiro}.${centavos}`
  }

  const formatarValorParaExibir = (valorCentsStr) => {
    if (!valorCentsStr || valorCentsStr.length === 0) return ''
    const padded = valorCentsStr.padStart(3, '0')
    let inteiro = padded.slice(0, -2)
    const centavos = padded.slice(-2)
    inteiro = inteiro.replace(/^0+/, '') || '0'
    return `${inteiro},${centavos}`
  }



  const adicionarNovoProduto = () => {
    const novoId = proximoId
    const novoProduto = {
      id: novoId,
      nome: 'Novo',
      valor: 0,
      quantidade: 1
    }
    const novaProd = [...produtos, novoProduto]
    setProdutos(novaProd)
    salvarProdutosArmazenamento(novaProd)
    setProximoId(novoId + 1)
    setProdutoOriginal(null)
    setEditandoId(novoId)
    setEditNome('Novo')
    setEditValor('')
    setAddProductClicked(true)
    setTimeout(() => setAddProductClicked(false), 150)
  }

  const cancelarEdicao = () => {
    if (produtoOriginal === null && editandoId !== null) {
      const novaProd = produtos.filter(p => p.id !== editandoId)
      setProdutos(novaProd)
      salvarProdutosArmazenamento(novaProd)
    } else if (produtoOriginal !== null) {
      const novaProd = produtos.map(p => 
        p.id === produtoOriginal.id ? produtoOriginal : p
      )
      setProdutos(novaProd)
      salvarProdutosArmazenamento(novaProd)
    }
    setEditandoId(null)
    setEditNome('')
    setEditValor('')
    setProdutoOriginal(null)
  }

  const removerProduto = (id) => {
    const novaProd = produtos.filter(p => p.id !== id)
    setProdutos(novaProd)
    salvarProdutosArmazenamento(novaProd)
  }

  const atualizarQuantidade = (id, novaQtd, type) => {
    const novaProd = produtos.map(p => 
      p.id === id ? {...p, quantidade: Math.max(0, novaQtd)} : p
    )
    setProdutos(novaProd)
    salvarProdutosArmazenamento(novaProd)
    
    const buttonKey = `${id}-${type}`
    setClickedQuantityButtons(prev => ({...prev, [buttonKey]: true}))
    setTimeout(() => {
      setClickedQuantityButtons(prev => ({...prev, [buttonKey]: false}))
    }, 150)
  }

  const clearNotesAndReceived = ()=>{
    setSelectedCounts({})
    setManualReceived('')
    setManualConfirmed(false)
    setClearNotesClicked(true)
    setTimeout(() => setClearNotesClicked(false), 150)
  }

  const resetQuantities = ()=>{
    const novaProd = produtos.map((p, index) => ({
      ...p,
      quantidade: index === 0 ? 1 : 0
    }))
    setProdutos(novaProd)
    salvarProdutosArmazenamento(novaProd)
    setResetClicked(true)
    setTimeout(() => setResetClicked(false), 150)
  }

  const total = useMemo(() => {
    return produtos.reduce((acc, p) => acc + (p.valor * p.quantidade), 0)
  }, [produtos])

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
    if (manualConfirmed && manualReceived && manualReceived.length > 0) {
      const padded = manualReceived.padStart(3, '0')
      const inteiro = padded.slice(0, -2)
      const centavos = padded.slice(-2)
      const valor = parseFloat(`${inteiro}.${centavos}`)
      if (!isNaN(valor) && valor > 0) return valor
    }
    return selectedSum
  },[manualReceived, manualConfirmed, selectedSum])

  const troco = useMemo(()=>{
    return parseFloat((receivedAmount - total).toFixed(2))
  },[receivedAmount, total])

  return (
    <div className="min-h-screen w-screen app-bg flex items-start justify-center pb-8">
      <div className="w-full max-w-[390px] mx-auto rounded-2xl shadow-lg p-4 border border-slate-300/40" style={{ backgroundColor: 'rgba(255,255,255,0.88)', backgroundImage: `url(${fundoImg})`, backgroundSize: '55% auto', backgroundPosition: 'center 35%', backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', transform: 'scale(1.1)', transformOrigin: 'top center' }}>
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Calculadora de Troco - Doces</h1>
        </header>

        <section className="mb-2 space-y-2">
          {produtos.map((p) => (
            <div key={p.id}>
              {editandoId === p.id ? (
                <div className="bg-blue-50 p-2 rounded-lg space-y-2 border-2 border-blue-300">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      placeholder="Nome"
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      style={{width: '60%'}}
                    />
                    <div className="flex gap-1 items-center" style={{width: '40%'}}>
                      <span className="text-sm font-medium">R$</span>
                      <input
                        ref={valorInputRef}
                        type="text"
                        value={formatarValorParaExibir(editValor)}
                        onInput={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          const limited = digits.length > 5 ? digits.slice(0, 5) : digits;
                          setEditValor(limited);
                        }}
                        placeholder="00,00"
                        inputMode="numeric"
                        className="flex-1 border border-gray-300 rounded px-1.5 py-1 text-sm text-right"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editarProduto(p.id, editNome, formatarValorParaSalvar(editValor))}
                      className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      ✓ Salvar
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="flex-1 bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg p-2 flex items-center gap-2">
                  <button
                    onClick={() => removerProduto(p.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-lg flex-shrink-0"
                  >
                    🗑
                  </button>
                  <div className="flex-1 cursor-pointer" onClick={() => iniciarEdicao(p.id, p.nome, p.valor)}>
                    <div className="font-medium text-slate-900 text-sm">{p.nome}</div>
                    <div className="text-xs text-slate-600">R$ {p.valor.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => atualizarQuantidade(p.id, p.quantidade - 1, 'minus')}
                      className={`bg-red-400 hover:bg-red-500 text-white font-bold text-xl px-3 py-2 rounded leading-none transition-all duration-100 ${
                        clickedQuantityButtons[`${p.id}-minus`] ? 'scale-95' : ''
                      }`}
                    >
                      −
                    </button>
                    <div className="text-sm font-medium min-w-[2rem] text-center bg-slate-950 text-white rounded px-2 py-1">
                      {String(p.quantidade).padStart(2,'0')}
                    </div>
                    <button
                      onClick={() => atualizarQuantidade(p.id, p.quantidade + 1, 'plus')}
                      className={`bg-green-400 hover:bg-green-500 text-white font-bold text-xl px-3 py-2 rounded leading-none transition-all duration-100 ${
                        clickedQuantityButtons[`${p.id}-plus`] ? 'scale-95' : ''
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex gap-2">
            <button
              onClick={resetQuantities}
              className={`w-[30%] text-white font-semibold py-1.5 rounded-lg text-xs shadow-sm transition-all duration-100 ${
                resetClicked ? 'scale-95' : ''
              } bg-slate-950/80`}
            >
              Limpar Qtd
            </button>
            <button
              onClick={adicionarNovoProduto}
              className={`flex-1 bg-blue-500 text-white font-semibold py-1.5 rounded-lg text-sm transition-all duration-100 ${
                addProductClicked ? 'scale-95' : ''
              }`}
            >
              + Adicionar Produto
            </button>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-900 bg-gray-300 px-2 py-1 rounded-md font-semibold">Total</div>
            <div className="text-2xl font-bold text-white bg-slate-950/80 px-2 py-1 rounded-md">R$ {total.toFixed(2)}</div>
          </div>
        </section>

        <section className="mb-4">
          <div className="text-sm text-slate-900 mb-2 bg-gray-300 inline-block px-2 py-1 rounded-md font-semibold">Dinheiro Recebido</div>
          <div className="flex flex-col gap-2 mb-2">
            <div className="relative input-with-button w-full">
              <input
                className="input-control pr-12 w-full"
                placeholder="Digite o valor recebido (ex: 50,00)"
                value={formatarValorManualParaExibir(manualReceived)}
                onFocus={()=> setFocusedManual(true)}
                onBlur={()=> setFocusedManual(false)}
                onInput={e=> {
                  const value = e.target.value
                  const digits = value.replace(/\D/g, '')
                  const limited = digits.length > 10 ? digits.slice(0, 10) : digits // Limita a 10 dígitos (99999999,99)
                  setManualReceived(limited)
                  setManualConfirmed(limited.length > 0)
                  setSelectedCounts({})
                }}
                inputMode="numeric"
              />
            </div>
            <div className="flex gap-2">
              <div className="text-sm text-slate-900 bg-gray-300 px-2 py-1 rounded-md font-semibold">ou</div>
              <div className="flex items-center gap-2 text-sm text-slate-900 font-medium bg-gray-300 px-2 py-1 rounded-md flex-1">
                Usar notas
                <button
                  type="button"
                  onClick={clearNotesAndReceived}
                  className={`text-xs font-semibold text-white bg-slate-950/80 px-2 py-1 rounded-md shadow-sm ml-auto transition-all duration-100 ${
                    clearNotesClicked ? 'scale-95' : ''
                  }`}
                >
                  Limpar
                </button>
              </div>
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

                  {count > 0 && (
                    <div
                      className="overlay-left"
                      onPointerDown={(e)=> e.preventDefault()}
                      onPointerUp={(e)=>{ e.stopPropagation(); removeNoteOne(n) }}
                      onPointerCancel={()=> {}}
                      onPointerLeave={()=> {}}
                    />
                  )}
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

          <div className="mt-3 text-sm text-slate-900 bg-gray-300 inline-block px-2 py-1 rounded-md font-semibold">Total Geral da Compra (R$) <span className="font-bold text-slate-900">R$ {total.toFixed(2)}</span></div>
        </section>

        <section>
          <div className={`mt-2 text-2xl font-bold ${isNaN(troco) ? 'text-slate-900' : troco >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
