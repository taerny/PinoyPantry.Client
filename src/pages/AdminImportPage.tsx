import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Check, AlertCircle, X, Trash2, ArrowRight, File } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7136';

const CATEGORIES = ['Noodles', 'Condiments', 'Soups & Mixes', 'Canned Goods', 'Snacks', 'Dairy', 'Beverages', 'Frozen', 'Rice & Grains', 'Dried Fish'];

// "reference" columns (GST, Total Revenue, etc.) are shown read-only for context; the rest are
// editable and feed straight into the import payload from wherever they sit in the row.
type ColumnRole = 'name' | 'stock' | 'cost' | 'recommendedRetail' | 'margin' | 'reference';

interface ImportColumn {
  name: string;
  value: string;
  role: ColumnRole;
}

interface ImportRow {
  columns: ImportColumn[];
  category: string;
  categoryGuessed: boolean;
  isPublished: boolean;
}

function findColumn(row: ImportRow, role: ColumnRole) {
  return row.columns.find(c => c.role === role);
}

interface PdfImportRow {
  code: string;
  name: string;
  alreadyExists: boolean;
}

export function AdminImportPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'excel' | 'pdf'>('excel');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF invoice import — deliberately much simpler than the Excel flow: Code + Name only.
  // Quantity/Cost are never trusted from the PDF (unreliable — see AdminProductsPage/Batches),
  // so every imported row is a draft the admin completes afterward via Edit + Batches.
  const [pdfRows, setPdfRows] = useState<PdfImportRow[]>([]);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfImporting, setPdfImporting] = useState(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  async function handlePdfFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPdfFileName(file.name);
    setMessage(null);
    setPdfUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/products/import/pdf-preview`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to read PDF.');
      }
      const parsed: PdfImportRow[] = await res.json();
      setPdfRows(parsed);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to read PDF.' });
    } finally {
      setPdfUploading(false);
    }
  }

  function updatePdfRow(index: number, field: 'code' | 'name', value: string) {
    setPdfRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  function removePdfRow(index: number) {
    setPdfRows(prev => prev.filter((_, i) => i !== index));
  }

  function clearPdfAll() {
    setPdfRows([]);
    setPdfFileName('');
    setMessage(null);
    if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
  }

  async function handlePdfImport() {
    if (!user) return;
    const toImport = pdfRows.filter(r => !r.alreadyExists);
    if (toImport.length === 0) return;
    setPdfImporting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/products/import/pdf-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(toImport.map(r => ({ code: r.code, name: r.name }))),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Import failed');
      }
      const data = await res.json();
      setMessage({ type: 'success', text: data.message });
      clearPdfAll();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Import failed.' });
    } finally {
      setPdfImporting(false);
    }
  }

  // Uploads the raw file as-is (.csv or .xlsx) — the API parses it (including guessing any
  // missing Category) and hands back every column from the sheet, in its original order,
  // review-ready. Nothing is written to the database yet.
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setFileName(file.name);
    setMessage(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/products/import/preview`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to read file.');
      }
      const parsed: ImportRow[] = await res.json();
      setRows(parsed);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to read file.' });
    } finally {
      setUploading(false);
    }
  }

  function updateColumn(rowIndex: number, colIndex: number, value: string) {
    setRows(prev => prev.map((r, i) => i !== rowIndex ? r : {
      ...r,
      columns: r.columns.map((c, ci) => ci === colIndex ? { ...c, value } : c),
    }));
  }

  function updateCategory(rowIndex: number, value: string) {
    setRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, category: value, categoryGuessed: false } : r));
  }

  function updatePublished(rowIndex: number, checked: boolean) {
    setRows(prev => prev.map((r, i) => i === rowIndex ? { ...r, isPublished: checked } : r));
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

    // Pull the typed fields the API needs out of each row's column list (by role) plus the
    // synthesized Category/Publish — this is the only place raw sheet strings get parsed.
    // Price is deliberately not set here at all — it's always 0 on import and gets set
    // afterward on the Products page, once the item actually exists.
    const payload = rows.map(row => ({
      name: findColumn(row, 'name')?.value ?? '',
      category: row.category,
      stockQuantity: parseInt(findColumn(row, 'stock')?.value ?? '', 10) || 0,
      costPrice: parseFloat(findColumn(row, 'cost')?.value ?? '') || 0,
      price: 0,
      isPublished: row.isPublished,
      recommendedRetail: (() => {
        const v = findColumn(row, 'recommendedRetail')?.value;
        return v ? parseFloat(v) || 0 : null;
      })(),
      margin: (() => {
        const v = findColumn(row, 'margin')?.value;
        return v ? parseFloat(v) || 0 : null;
      })(),
    }));

    try {
      const res = await fetch(`${API_URL}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Import failed');
      }
      const data = await res.json();
      setMessage({ type: 'success', text: data.message });
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
  const guessedCategoryCount = rows.filter(r => r.categoryGuessed).length;
  // Column set (names, order, count) comes straight from the uploaded file.
  const columnNames = rows[0]?.columns.map(c => c.name) ?? [];

  return (
    <AdminLayout activePage="products">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#3E2723]">Import Products</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mode === 'excel'
              ? 'Upload your supplier pricing sheet as-is (.xlsx or .csv) — every column shows up exactly as in your file, plus a Category you set here. Selling price isn\'t set here — every imported product starts at $0 and you set its price afterward in Product Management, along with publishing it.'
              : "Upload a supplier invoice PDF — just the product code and name get pulled out (quantity/unit price on invoices aren't reliable, so they're never trusted here). Each row becomes a draft product; set its category, cost, and quantity afterward via Edit and Batches."}
          </p>
        </div>

        <div className="flex gap-1 p-1 mb-5 bg-gray-100 border border-gray-200 rounded-xl w-fit">
          <button
            onClick={() => setMode('excel')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              mode === 'excel' ? 'bg-white text-[#D32F2F] border border-red-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Excel / CSV
          </button>
          <button
            onClick={() => setMode('pdf')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              mode === 'pdf' ? 'bg-white text-[#D32F2F] border border-red-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <File className="w-3.5 h-3.5" /> Invoice PDF
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {message.text}
            {message.type === 'success' && (
              <Link to="/admin/products" className="inline-flex items-center gap-1 font-medium underline hover:no-underline">
                View Products <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <button onClick={() => setMessage(null)} className="ml-auto text-current opacity-50 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {mode === 'excel' && (rows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Upload your pricing sheet — <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">.xlsx</code> or <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">.csv</code>, whatever you already use</p>
            <p className="text-xs text-gray-400 mb-1">Every column from your file shows up in the review table exactly as it is — nothing renamed or hidden. A few (Product/Name, Quantity, Cost, Recommended Retail, Margin) are recognized and made editable; the rest are shown for reference.</p>
            <p className="text-xs text-gray-400 mb-4">You'll also get a Category dropdown (guessed from the product name if your sheet doesn't have one). Selling price isn't set here — every product imports at $0 and you set its price afterward in Product Management. If the file has multiple sheets, the one with the most rows is used.</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors cursor-pointer">
              <FileText className="w-4 h-4" />
              {uploading ? 'Reading File...' : 'Choose File'}
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} disabled={uploading} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#3E2723]">{fileName} — {rows.length} product(s) parsed</p>
                {guessedCategoryCount > 0 && (
                  <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {guessedCategoryCount} row(s) had no Category column — guessed from the product name (marked below). Double-check these before importing.
                  </p>
                )}
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
              <table className="w-full" style={{ minWidth: `${420 + columnNames.length * 130}px` }}>
                <thead className="bg-gray-50 border-b sticky top-0 z-20">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap sticky left-0 z-10 bg-gray-50 border-r">Category</th>
                    {rows[0]?.columns.map((col, ci) => (
                      <th
                        key={ci}
                        className={`text-right px-4 py-3 text-xs font-semibold uppercase whitespace-nowrap ${col.role === 'reference' ? 'text-gray-400' : 'text-gray-500'}`}
                        title={col.role === 'reference' ? 'From your file — reference only, not imported' : 'From your file — editable'}
                      >
                        {col.name}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Publish</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, i) => {
                    const unknownCategory = !CATEGORIES.includes(row.category);
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 sticky left-0 z-10 bg-white border-r">
                          <div className="flex items-center gap-1.5">
                            <select value={row.category} onChange={e => updateCategory(i, e.target.value)} className={`text-sm px-2 py-1 border rounded focus:outline-none focus:border-[#F9A825] ${unknownCategory ? 'border-amber-400 bg-amber-50' : row.categoryGuessed ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:border-gray-200'}`}>
                              {unknownCategory && <option value={row.category}>{row.category} (new)</option>}
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {row.categoryGuessed && (
                              <span title="Guessed from the product name — not in the source file" className="text-[10px] font-medium text-blue-500 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5 whitespace-nowrap">
                                guessed
                              </span>
                            )}
                          </div>
                        </td>
                        {row.columns.map((col, ci) => (
                          <td key={ci} className="px-4 py-2 text-right">
                            {col.role === 'reference' ? (
                              <span className="text-sm text-gray-400 whitespace-nowrap">{col.value}</span>
                            ) : col.role === 'name' ? (
                              <input value={col.value} onChange={e => updateColumn(i, ci, e.target.value)} className="w-full text-sm px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none text-left" />
                            ) : (
                              <input type="number" step="0.01" value={col.value} onChange={e => updateColumn(i, ci, e.target.value)} className="w-20 text-sm text-right px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none" />
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center">
                          <input type="checkbox" checked={row.isPublished} onChange={e => updatePublished(i, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#D32F2F] focus:ring-[#F9A825]" />
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
        ))}

        {mode === 'pdf' && (pdfRows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Upload a supplier invoice — <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">.pdf</code></p>
            <p className="text-xs text-gray-400 mb-1">Only the product code and name get extracted. Quantity and unit price on invoices aren't reliable (sometimes a box total, sometimes per-item — no way to tell from the PDF alone), so they're never trusted here.</p>
            <p className="text-xs text-gray-400 mb-4">Each row becomes an unpublished draft product. Set its category, cost, and quantity afterward via Edit and the Batches button — cost/quantity always come from your own cost document, never from the invoice PDF.</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors cursor-pointer">
              <File className="w-4 h-4" />
              {pdfUploading ? 'Reading PDF...' : 'Choose PDF'}
              <input ref={pdfFileInputRef} type="file" accept=".pdf" onChange={handlePdfFileSelect} disabled={pdfUploading} className="hidden" />
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#3E2723]">{pdfFileName} — {pdfRows.length} row(s) found</p>
                {pdfRows.some(r => r.alreadyExists) && (
                  <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {pdfRows.filter(r => r.alreadyExists).length} row(s) already exist (matching product code) — these are skipped automatically, not re-created.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearPdfAll} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handlePdfImport} disabled={pdfImporting || pdfRows.every(r => r.alreadyExists)} className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors shadow-sm disabled:opacity-50">
                  {pdfImporting ? 'Importing...' : `Import ${pdfRows.filter(r => !r.alreadyExists).length} Product(s)`}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[70vh]">
              <table className="w-full">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pdfRows.map((row, i) => (
                    <tr key={i} className={`hover:bg-gray-50/50 ${row.alreadyExists ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2">
                        <input
                          value={row.code}
                          disabled={row.alreadyExists}
                          onChange={e => updatePdfRow(i, 'code', e.target.value)}
                          className="w-32 text-sm px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none font-mono"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={row.name}
                          disabled={row.alreadyExists}
                          onChange={e => updatePdfRow(i, 'name', e.target.value)}
                          className="w-full text-sm px-2 py-1 border border-transparent hover:border-gray-200 focus:border-[#F9A825] rounded focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        {row.alreadyExists ? (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap">already exists</span>
                        ) : (
                          <span className="text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 whitespace-nowrap">new</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removePdfRow(i)} className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove row">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
      </div>
    </AdminLayout>
  );
}
