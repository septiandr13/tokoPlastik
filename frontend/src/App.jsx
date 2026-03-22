import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import BarangPage from './pages/BarangPage.jsx';
import TransaksiPage from './pages/TransaksiPage.jsx';
import LaporanPage from './pages/LaporanPage.jsx';

const { Header, Content, Footer } = Layout;

export default function App() {
  const items = [
    { key: 'barang', label: <Link to="/barang">Barang</Link> },
    { key: 'transaksi', label: <Link to="/transaksi">Transaksi</Link> },
    { key: 'laporan', label: <Link to="/laporan">Laporan</Link> }
  ];
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>Toko Plastik</div>
          <Menu theme="dark" mode="horizontal" items={items} selectable={false} />
        </Header>
        <Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/barang" />} />
            <Route path="/barang" element={<BarangPage />} />
            <Route path="/transaksi" element={<TransaksiPage />} />
            <Route path="/laporan" element={<LaporanPage />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Toko Plastik</Footer>
      </Layout>
    </BrowserRouter>
  );
}
