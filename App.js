import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateKeyPair, signData, verifySignature } from './crypto-utils';

const SmartWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [userKeys, setUserKeys] = useState({ publicKey: '', privateKey: '' });
  const [dailyOfflineTotal, setDailyOfflineTotal] = useState(0);

  const LIMIT_PER_TX = 500;
  const LIMIT_DAILY = 2000;

  useEffect(() => {
    const initWallet = async () => {
      let keys = await AsyncStorage.getItem('wallet_keys');
      if (!keys) {
        const newKeys = await generateKeyPair();
        await AsyncStorage.setItem('wallet_keys', JSON.stringify(newKeys));
        keys = JSON.stringify(newKeys);
      }
      setUserKeys(JSON.parse(keys));
      
      const savedBalance = await AsyncStorage.getItem('wallet_balance');
      if (savedBalance) setBalance(parseFloat(savedBalance));
      
      const savedTx = await AsyncStorage.getItem('wallet_transactions');
      if (savedTx) setTransactions(JSON.parse(savedTx));
      
      const today = new Date().toDateString();
      const savedDaily = await AsyncStorage.getItem('offline_daily');
      if (savedDaily) {
        const data = JSON.parse(savedDaily);
        if (data.date === today) setDailyOfflineTotal(data.amount);
        else setDailyOfflineTotal(0);
      }
    };
    initWallet();
  }, []);

  useEffect(() => {
    const checkOnline = () => {
      setInterval(() => {
        setIsOnline(navigator.onLine || false);
      }, 10000);
    };
    checkOnline();
  }, []);

  const createOfflinePayment = useCallback(async (recipientId, amountStr, recipientName) => {
    const amount = parseFloat(amountStr);
    
    if (amount > LIMIT_PER_TX) {
      Alert.alert('⚠️ Limitasyon', `Hanggang ₱${LIMIT_PER_TX} lang bawat bayad kapag walang internet.`);
      return null;
    }
    if (dailyOfflineTotal + amount > LIMIT_DAILY) {
      Alert.alert('⚠️ Limitasyon', `Naabot na ang pang-araw-araw na halaga na ₱${LIMIT_DAILY}.`);
      return null;
    }
    if (amount > balance) {
      Alert.alert('❌ Kulang', 'Wala kang sapat na halaga.');
      return null;
    }

    const tx = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      recipientId,
      recipientName,
      amount,
      type: 'offline_payment',
      status: 'pending_sync'
    };

    tx.signature = await signData(tx, userKeys.privateKey);

    const newBalance = balance - amount;
    setBalance(newBalance);
    await AsyncStorage.setItem('wallet_balance', newBalance.toString());

    const newDaily = dailyOfflineTotal + amount;
    setDailyOfflineTotal(newDaily);
    await AsyncStorage.setItem('offline_daily', JSON.stringify({
      date: new Date().toDateString(),
      amount: newDaily
    }));

    const updatedTx = [tx, ...transactions];
    setTransactions(updatedTx);
    await AsyncStorage.setItem('wallet_transactions', JSON.stringify(updatedTx));

    Alert.alert('✅ Tapos na!', `Nakabayad ka ng ₱${amount} kay ${recipientName}`);
    return tx;
  }, [balance, dailyOfflineTotal, transactions, userKeys]);

  useEffect(() => {
    if (!isOnline) return;
    const syncPending = async () => {
      const pending = transactions.filter(t => t.status === 'pending_sync');
      if (pending.length === 0) return;
      
      const updated = transactions.map(t =>
        t.status === 'pending_sync' ? { ...t, status: 'confirmed' } : t
      );
      setTransactions(updated);
      await AsyncStorage.setItem('wallet_transactions', JSON.stringify(updated));
    };
    syncPending();
  }, [isOnline, transactions]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isOnline ? '🟢 Nakakonekta' : '🔴 Walang internet — Gumagana pa rin!'}
        </Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Laman ng Pitaka</Text>
        <Text style={styles.balanceAmount}>₱ {balance.toFixed(2)}</Text>
        {!isOnline && (
          <Text style={styles.limitsText}>
            Natitira ngayong araw: ₱{(LIMIT_DAILY - dailyOfflineTotal).toFixed(2)}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="💳 Magbayad"
          onPress={() => {
            Alert.prompt('Magbayad', 'Ilagay: ID,Tindahan,Halaga',
              [
                { text: 'Kanselahin', style: 'cancel' },
                { text: 'Bayad', onPress: (input) => {
                  if (!input) return;
                  const [id, name, amt] = input.split(',');
                  createOfflinePayment(id?.trim(), amt, name?.trim());
                }}
              ]
            );
          }}
          color="#2ecc71"
        />
      </View>

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Talaan</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>Wala pang talaan</Text>
        ) : (
          transactions.slice(0, 5).map(tx => (
            <View key={tx.id} style={styles.txItem}>
              <Text>₱{tx.amount.toFixed(2)} — {tx.recipientName}</Text>
              <Text style={styles.txStatus}>
                {tx.status === 'pending_sync' ? '⏳ Hinihintay' : '✅ Tapos'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  statusBar: { alignItems: 'center', marginBottom: 10 },
  balanceCard: {
    backgroundColor: '#fff', padding: 25, borderRadius: 15,
    alignItems: 'center', marginBottom: 20, elevation: 5
  },
  balanceLabel: { fontSize: 16, color: '#666' },
  balanceAmount: { fontSize: 42, fontWeight: 'bold', color: '#2ecc71', marginVertical: 10 },
  limitsText: { fontSize: 12, color: '#e67e22', marginTop: 8 },
  actions: { marginBottom: 20 },
  history: { backgroundColor: '#fff', padding: 15, borderRadius: 12 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#aaa', padding: 15 },
  txItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  txStatus: { fontSize: 12, color: '#888' }
});

export default SmartWallet;
