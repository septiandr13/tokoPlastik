import React from 'react';
import { Card, Row, Col, Button, InputNumber, DatePicker, Table, message } from 'antd';
import api from '../api/api';
import BarangTable from '../components/BarangTable.jsx';
import NotaPrint from '../components/NotaPrint.jsx';
import ReactToPrint from 'react-to-print';

export default function TransaksiPage() {
  const [barang, setBarang] = React.useState([]);
  const [loadingBarang, setLoadingBarang] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [listTransaksi, setListTransaksi] = React.useState([]);
  const [lastSaved, setLastSaved] = React.useState(null);
  const printRef = React.useRef();

  const loadBarang = async () => {
    setLoadingBarang(true);
    try {
      const res = await api.get('/barang');
      setBarang(res.data);
    } finally {
      setLoadingBarang(false);
    }
  };

  const loadTransaksi = async (from, to) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await api.get('/transaksi', { params });
    setListTransaksi(res.data);
  };

  React.useEffect(() => {
    loadBarang();
    loadTransaksi();
  }, []);

  const addItem = (b) => {
    const exists = items.find(x => x.barang_id === b.id);
    if (exists) {
      const updated = items.map(x => x.barang_id === b.id ? { ...x, jumlah: x.jumlah + 1 } : x);
      setItems(updated);
    } else {
      setItems([...items, { barang_id: b.id, nama: b.nama_barang, harga: b.harga, jumlah: 1, stok: b.stok }]);
    }
  };

  const updateJumlah = (barang_id, jumlah) => {
    const updated = items.map(x => x.barang_id === barang_id ? { ...x, jumlah: jumlah || 0 } : x);
    setItems(updated);
  };

  const removeItem = (barang_id) => {
    setItems(items.filter(x => x.barang_id !== barang_id));
  };

  const total = items.reduce((s, it) => s + it.harga * it.jumlah, 0);

  const save = async () => {
    if (items.length === 0) return;
    if (items.some(it => it.jumlah <= 0)) {
      message.error('Jumlah harus > 0');
      return;
    }
    setSaving(true);
    try {
      const payload = { items: items.map(it => ({ barang_id: it.barang_id, jumlah: it.jumlah })) };
      const res = await api.post('/transaksi', payload);
      message.success('Tersimpan');
      setLastSaved(res.data);
      setItems([]);
      loadBarang();
      loadTransaksi();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Gagal simpan');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Barang', dataIndex: 'nama' },
    { title: 'Harga', dataIndex: 'harga', render: v => new Intl.NumberFormat('id-ID').format(v) },
    { title: 'Jumlah', dataIndex: 'jumlah', render: (v, r) => (
      <InputNumber min={1} max={r.stok} value={v} onChange={val => updateJumlah(r.barang_id, val)} />
    ) },
    { title: 'Subtotal', render: (_, r) => new Intl.NumberFormat('id-ID').format(r.harga * r.jumlah) },
    { title: 'Aksi', render: (_, r) => <Button danger onClick={() => removeItem(r.barang_id)}>Hapus</Button> }
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card title="Pilih Barang">
          <BarangTable data={barang} loading={loadingBarang} onSelectRow={addItem} />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title="Keranjang">
          <Table
            rowKey="barang_id"
            columns={columns}
            dataSource={items}
            pagination={false}
            size="small"
          />
          <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 600 }}>
            Total: {new Intl.NumberFormat('id-ID').format(total)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button type="primary" disabled={items.length === 0} loading={saving} onClick={save}>Simpan Transaksi</Button>
            {lastSaved && (
              <ReactToPrint trigger={() => <Button>Print Nota</Button>} content={() => printRef.current} />
            )}
          </div>
          <div style={{ height: 0, overflow: 'hidden' }}>
            <NotaPrint ref={printRef} transaksi={lastSaved} />
          </div>
        </Card>
        <Card title="Daftar Transaksi" style={{ marginTop: 16 }}>
          <Table
            rowKey="id"
            columns={[
              { title: 'Tanggal', dataIndex: 'tanggal' },
              { title: 'Nomor', dataIndex: 'nomor_transaksi' },
              { title: 'Total', dataIndex: 'total', render: v => new Intl.NumberFormat('id-ID').format(v) },
              { title: 'Item', render: (_, r) => (r.TransaksiDetails || []).length }
            ]}
            dataSource={listTransaksi}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );
}
