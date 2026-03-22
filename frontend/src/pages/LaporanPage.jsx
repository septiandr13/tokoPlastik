import React from 'react';
import { Card, DatePicker, Row, Col, Statistic, Space, Table, Button } from 'antd';
import api from '../api/api';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer, Legend } from 'recharts';
import ReactToPrint from 'react-to-print';

export default function LaporanPage() {
  const [range, setRange] = React.useState([null, null]);
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState({ total_omzet: 0, total_transaksi: 0, avg_transaksi: 0 });
  const [daily, setDaily] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const printRef = React.useRef();

  const load = async (from, to) => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get('/laporan/ringkas', { params });
      setSummary(res.data.summary);
      setDaily(res.data.daily);
      setItems(res.data.items.slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const onRangeChange = (vals) => {
    setRange(vals);
    const from = vals && vals[0] ? vals[0].format('YYYY-MM-DD') : undefined;
    const to = vals && vals[1] ? vals[1].format('YYYY-MM-DD') : undefined;
    load(from, to);
  };

  return (
    <div ref={printRef}>
      <Space style={{ marginBottom: 12 }}>
        <DatePicker.RangePicker onChange={onRangeChange} />
        <ReactToPrint trigger={() => <Button type="primary">Print Laporan</Button>} content={() => printRef.current} />
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Omzet" value={summary.total_omzet} precision={0} formatter={v => new Intl.NumberFormat('id-ID').format(v)} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total Transaksi" value={summary.total_transaksi} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Rata-rata/Transaksi" value={summary.avg_transaksi} precision={0} formatter={v => new Intl.NumberFormat('id-ID').format(v)} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={14}>
          <Card title="Penjualan per Hari" loading={loading}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={daily}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="tanggal" />
                  <YAxis />
                  <Tooltip formatter={(v) => new Intl.NumberFormat('id-ID').format(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Omzet" stroke="#1677ff" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Top Barang (Omzet)" loading={loading}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={items}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="nama_barang" tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                  <YAxis />
                  <Tooltip formatter={(v) => new Intl.NumberFormat('id-ID').format(v)} />
                  <Legend />
                  <Bar dataKey="omzet" name="Omzet" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      <Card title="Ringkasan Harian" style={{ marginTop: 12 }}>
        <Table
          rowKey="tanggal"
          columns={[
            { title: 'Tanggal', dataIndex: 'tanggal' },
            { title: 'Omzet', dataIndex: 'total', render: v => new Intl.NumberFormat('id-ID').format(v) }
          ]}
          dataSource={daily}
          size="small"
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
}
