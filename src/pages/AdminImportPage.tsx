import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

const CATEGORIES = ['Noodles', 'Condiments', 'Soups & Mixes', 'Canned Goods', 'Snacks', 'Dairy', 'Beverages', 'Frozen', 'Rice & Grains', 'Sweets', 'Dried Fish'];

interface ImportRow {
  name: string;
  category: string;
  stockQuantity: number;
  costPrice: number;
  price: number;
  isPublished: boolean;
}

// Splits a CSV line respecting quoted fields (handles commas inside quotes)
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
  const nameIdx = headers.indexOf('name');
  const categoryIdx = headers.indexOf('category');
  const stockIdx = headers.indexOf('stockquantity');
  const costIdx = headers.indexOf('costprice');
  const priceIdx = headers.indexOf('price');
  const publishedIdx = headers.indexOf('ispublished');

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = parseCsvLine(line);
    return {
      name: cols[nameIdx] ?? '',
      category: cols[categoryIdx] ?? '',
      stockQuantity: parseInt(cols[stockIdx], 10) || 0,
      costPrice: parseFloat(cols[costIdx]) || 0,
      price: parseFloat(cols[priceIdx]) || 0,
      isPublished: (cols[publishedIdx] ?? '').toLowerCase() === 'true',
    };
  });
}

export function AdminImportPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCsv(text);
        if (parsed.length === 0) {
          setMessage({ type: 'error', text: 'No rows found — check the CSV has Name, Category, StockQuantity, CostPrice, Price, IsPublished columns.' });
          return;
        }
        setRows(parsed);
      } catch {
        setMessage({ type: 'error', text: 'Failed to parse CSV file.' });
      }
    };
    reader.readAsText(file);
  }

  function updateRow(index: number, field: keyof ImportRow, value: string | number | boolean) {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  function removeRow(index: number) {
    setRows(prev => prev.filter((_, i) => i !== index));
  }

  function clearAll() {
    setRows([]);
    setFileName('');
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleImport() {
    if (!user || rows.length === 0) return;
    setImporting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(rows),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Import failed');
      }
      const data = await res.json();
      setMessage({ type: 'success', text: `${data.message} Review and publish them in Product Management.` });
      setRows([]);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Import failed.' });
    } finally {
      setImporting(false);
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-xl font-bold text-[#3E2723] mb-2">Access Denied</h2><a href="/login" className="text-[#D32F2F] hover:underline">Go to Login</a></div></div>;

  const unknownCategoryCount = rows.filter(r => !CATEGORIES.includes(r.category)).length;

  return (
    <AdminLayout activePage="products">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#3E2723]">Import Products</h2>
          <p className="text-xs text-gray-400 mt-0.5">Upload a supplier order CSV — review every row before it's imported. Nothing goes live until you publish it in Product Management.</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Upload a CSV with columns: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Name, Category, StockQuantity, CostPrice, Price, IsPublished</code></p>
            <p className="text-xs text-gray-400 mb-4">A "Code" column is fine too — it's ignored on import.</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors cursor-pointer">
              <FileText className="w-4 h-4" />
              Choose CSV File
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#3E2723]">{fileName} — {rows.length} product(s) parsed</p>
                {unknownCategoryCount > 0 && (
                  <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {unknownCategoryCount} row(s) have a category not in the current list — double-check before importing.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleImport} disabled={importing} className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors shadow-sm disabled:opacity-50">
                  {importing ? 'Importing...' : `Import ${rows.length} Product(s)`}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[70vh]">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cost</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Publish</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, i) => {
                    const unknownCategory = !CATEGORIES.includes(row.category);
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2">
                          <input value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} className="w-full text-sm px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none" />
                        </td>
                        <td className="px-4 py-2">
                          <select value={row.category} onChange={e => updateRow(i, 'category', e.target.value)} className={`text-sm px-2 py-1 border rounded focus:outline-none focus:border-[#F9A825] ${unknownCategory ? 'border-amber-400 bg-amber-50' : 'border-transparent hover:border-gray-200'}`}>
                            {unknownCategory && <option value={row.category}>{row.category} (new)</option>}
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" min="0" value={row.stockQuantity} onChange={e => updateRow(i, 'stockQuantity', parseInt(e.target.value, 10) || 0)} className="w-16 text-sm text-right px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" step="0.01" min="0" value={row.costPrice} onChange={e => updateRow(i, 'costPrice', parseFloat(e.target.value) || 0)} className="w-20 text-sm text-right px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" step="0.01" min="0" value={row.price} onChange={e => updateRow(i, 'price', parseFloat(e.target.value) || 0)} className="w-20 text-sm text-right px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input type="checkbox" checked={row.isPublished} onChange={e => updateRow(i, 'isPublished', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#D32F2F] focus:ring-[#F9A825]" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => removeRow(i)} className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove row">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
