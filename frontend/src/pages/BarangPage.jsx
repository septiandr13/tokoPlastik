import React from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import api from '../api/api';
import BarangTable from '../components/BarangTable.jsx';

export default function BarangPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/barang');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const onDelete = async (record) => {
    await api.delete(`/barang/${record.id}`);
    message.success('Dihapus');
    load();
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await api.put(`/barang/${editing.id}`, values);
      message.success('Diperbarui');
    } else {
      await api.post('/barang', values);
      message.success('Ditambah');
    }
    setOpen(false);
    load();
  };

  return (
    <Card
      title="Barang"
      extra={<Button type="primary" onClick={onAdd}>Tambah</Button>}
    >
      <BarangTable
        data={data}
        loading={loading}
        onSelectRow={(r) => {
          Modal.info({
            title: 'Aksi',
            content: (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={() => { onEdit(r); Modal.destroyAll(); }}>Edit</Button>
                <Popconfirm title="Hapus?" onConfirm={() => { onDelete(r); Modal.destroyAll(); }}>
                  <Button danger>Hapus</Button>
                </Popconfirm>
              </div>
            ),
            okButtonProps: { style: { display: 'none' } }
          });
        }}
      />

      <Modal
        title={editing ? 'Edit Barang' : 'Tambah Barang'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="kode_barang" label="Kode" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="nama_barang" label="Nama" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="harga" label="Harga" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stok" label="Stok" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="satuan" label="Satuan" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'pcs', label: 'pcs' },
                { value: 'pack', label: 'pack' },
                { value: 'lusin', label: 'lusin' },
                { value: 'kg', label: 'kg' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
