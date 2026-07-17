"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Phone, Car, Search } from "lucide-react";
import { api } from "@/lib/api-client";

interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  vehicles: { plateNumber: string; vehicleType: string }[];
  _count: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", plateNumber: "" });
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    api.customers(search || undefined)
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const debounce = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createCustomer(form);
    setShowForm(false);
    setForm({ name: "", phone: "", plateNumber: "" });
    fetchCustomers();
  };

  return (
    <PageLayout
      title="کڕیارەکان"
      subtitle={`${customers.length} کڕیار`}
      action={
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + کڕیاری نوێ
        </button>
      }
    >
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="input-field pr-10"
          placeholder="گەڕان بە ناو یان ژمارە..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-4">
          <h3 className="mb-3 font-bold">کڕیاری نوێ</h3>
          <div className="grid gap-3">
            <input
              className="input-field"
              placeholder="ناو *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="input-field"
              placeholder="ژمارەی تەلەفۆن *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <input
              className="input-field"
              placeholder="ژمارەی ئۆتۆمبێل"
              value={form.plateNumber}
              onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">پاشەکەوت</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">هەڵوەشاندن</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">هیچ کڕیارێک نییە</div>
      ) : (
        <div className="flex flex-col gap-3">
          {customers.map((customer) => (
            <div key={customer.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{customer.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={12} />
                    {customer.phone}
                  </div>
                  {customer.vehicles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {customer.vehicles.map((v) => (
                        <span
                          key={v.plateNumber}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600"
                        >
                          <Car size={10} />
                          {v.plateNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">{customer._count.orders} داواکاری</p>
                  <p className="text-xs font-medium text-brand-600">
                    {customer.loyaltyPoints} خاڵ
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
