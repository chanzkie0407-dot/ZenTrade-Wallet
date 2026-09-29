// ==================================================
// ZenTrade Wallet — WEB VERSION
// Gumagana sa browser • I-upload sa Render
// ==================================================

import React, { useState, useEffect } from 'react';
import './App.css';

const WebWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  const LIMIT_PER_TX = 500;
  const LIMIT_DAILY = 2000;

  useEffect(() => {
    const savedBalance = localStorage.getItem('wallet_balance');
    if (savedBalance) setBalance(parseFloat(savedBalance));
    
    const savedTx = localStorage.getItem('wallet_transactions');
    if (savedTx) setTransactions(JSON.parse(savedTx));
  }, []);

  const handlePayment = () => {
    const amt = parseFloat(amount);
    
    if (!recipientId || !recipientName || !amt) {
      alert('⚠️ Punan lahat ng patlang');
      return;
    }
    if (amt > LIMIT_PER_TX) {
      alert(`⚠️ Hanggang ₱${LIMIT_PER_TX} lang bawat bayad`);
      return;
    }
    if (amt > balance) {
      alert('❌ Kulang ang laman ng pitaka');
      return;
    }

    const tx = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleString(),
      recipientId,
      recipientName,
      amount: amt,
      status: 'confirmed'
    };

    const newBalance = balance - amt;
    setBalance(newBalance);
    localStorage.setItem('wallet_balance', newBalance.toString());

    const updatedTx = [tx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem('wallet_transactions', JSON.stringify(updatedTx));

    alert(`✅ Nakabayad ng ₱${amt} kay ${recipientName}!`);
    setRecipientId('');
    setRecipientName('');
    setAmount('');
  };

  const addFunds = () => {
    const add = prompt('Magkano ang ilalagay?');
    if (!add) return;
    const num = parseFloat(add);
    if (isNaN(num)) return;
    const newBalance = balance + num;
    setBalance(newBalance);
    localStorage.setItem('wallet_balance', newBalance.toString());
  };

  return (
    <div className="app">
      <header>
        <h1>💰 ZenTrade Wallet</h1>
        <p className="status">{isOnline ? '🟢 Nakakonekta' : '🔴 Walang internet'}</p>
      </header>

      <main>
        <div className="balance-card">
          <p className="label">Laman ng Pitaka</p>
          <p className="amount">₱ {balance.toFixed(2)}</p>
          <button className="btn-secondary" onClick={addFunds}>➕ Maglagay ng Pera</button>
        </div>

        <div className="form-card">
          <h2>💳 Magbayad</h2>
          <input
            type="text"
            placeholder="ID ng Tindahan / Tatanggap"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Pangalan ng Tatanggap"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Halaga"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="btn-primary" onClick={handlePayment}>Kumpirmahin ang Bayad</button>
          <p className="limit">Limitasyon: ₱{LIMIT_PER_TX}/bawat bayad • ₱{LIMIT_DAILY}/araw</p>
        </div>

        <div className="history-card">
          <h2>📋 Talaan ng Bayad</h2>
          {transactions.length === 0 ? (
            <p className="empty">Wala pang transaksyon</p>
          ) : (
            <ul>
              {transactions.map(tx => (
                <li key={tx.id}>
                  <span className="tx-amount">-₱{tx.amount.toFixed(2)}</span>
                  <span className="tx-name">{tx.recipientName}</span>
                  <span className="tx-date">{tx.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer>
        <p>✅ ZenTrade Wallet — Ligtas • Libre • Para sa Pilipinas</p>
      </footer>
    </div>
  );
};

export default WebWallet;
