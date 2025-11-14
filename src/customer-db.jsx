import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  DollarSign,
  Filter,
  MessageCircle,
  MessageSquare,
  Phone,
  Search,
  Send,
  Users,
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetCustomerDataFetch } from './hook/dbOperation';
import { useAppData } from './zustand/appData';

// Toast Notification Component
export const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 transform"
        >
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
              type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MessageModal = ({
  isOpen,
  onClose,
  customer,
  onSendWhatsApp,
  loaderPorps,
  bulkPhoneNumbers = [],
  onSendWhatsAppBulk,
}) => {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [selectedTemplateLanguage, setSelectedTemplateLanguage] = useState('');
  const [selectedTemplateObj, setSelectedTemplateObj] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const maxLength = 300;
  const [tpls, setTpls] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState('');
  const [tplQuery, setTplQuery] = useState('');

  // Media upload states
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'IMAGE', 'VIDEO', 'DOCUMENT'
  const [uploadError, setUploadError] = useState('');

  // WhatsApp supported formats
  const SUPPORTED_FORMATS = {
    IMAGE: ['.jpg', '.jpeg', '.png'],
    VIDEO: ['.mp4', '.3gp'],
    DOCUMENT: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  };

  const MAX_FILE_SIZES = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    VIDEO: 16 * 1024 * 1024, // 16MB
    DOCUMENT: 100 * 1024 * 1024, // 100MB
  };

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    (async () => {
      setTplLoading(true);
      setTplError('');
      try {
        const base = (import.meta?.env?.VITE_BACKEND_API || 'http://localhost:3003/api').replace(
          /\/$/,
          ''
        );
        const url = `${base}/messages/whatsapp/templates`;
        const res = await axios.get(url, { signal: controller.signal });

        const list = res?.data?.data || [];
        const filteredData = list.data?.filter(
          (item) => item?.name !== 'hello_world' && item?.name !== 'transaction_bill'
        );

        setTpls(filteredData);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Failed to load templates:', e);
          const status = e?.response?.status;
          const msg = e?.message || 'Unknown error';
          setTplError(`Failed to load templates${status ? ` (${status})` : ''}: ${msg}`);
        }
      } finally {
        setTplLoading(false);
      }
    })();
    return () => controller.abort();
  }, [isOpen]);

  const extractBodyText = (tpl) => {
    const body = (tpl?.components || []).find((c) => c.type === 'BODY');
    return body?.text || '';
  };

  const countPlaceholders = (text) => {
    if (!text) return 0;
    const matches = String(text).match(/\{\{\d+\}\}/g);
    return matches ? matches.length : 0;
  };

  const getHeaderFormat = (tpl) => {
    const header = (tpl?.components || []).find((c) => c.type === 'HEADER');
    return header?.format?.toUpperCase() || null;
  };

  const defaultParamValues = (n) => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const candidates = [customer?.name || '', date, time, '100', '12345', 'https://example.com'];
    const out = [];
    for (let i = 0; i < n; i++) out.push(candidates[i] ?? '');
    return out;
  };

  const buildComponentsForTemplate = (tpl) => {
    if (!tpl) return undefined;
    const comps = [];

    // HEADER
    const headerAny = (tpl.components || []).find((c) => c.type === 'HEADER');
    if (headerAny) {
      const fmt = (headerAny.format || '').toUpperCase();
      if (fmt === 'TEXT' && typeof headerAny.text === 'string') {
        const n = countPlaceholders(headerAny.text);
        if (n > 0) {
          const vals = defaultParamValues(n);
          comps.push({ type: 'header', parameters: vals.map((v) => ({ type: 'text', text: v })) });
        }
      } else if (fmt === 'IMAGE' || fmt === 'VIDEO' || fmt === 'DOCUMENT') {
        if (mediaFile) {
          // When a file is selected, do NOT embed base64 data URLs in components (too large).
          // Send a small blob marker; backend will replace with uploaded Supabase URL.
          const mediaKey = fmt === 'IMAGE' ? 'image' : fmt === 'VIDEO' ? 'video' : 'document';
          const mediaParam = { type: mediaKey };
          mediaParam[mediaKey] = {
            filename: mediaFile.name,
            link: 'blob://upload',
          };
          comps.push({ type: 'header', parameters: [mediaParam] });
        } else {
          const exampleHandles = headerAny.example?.header_handle;
          const exampleUrls = headerAny.example?.header_url;
          let exampleMedia = Array.isArray(exampleHandles)
            ? exampleHandles[0]
            : typeof exampleHandles === 'string'
              ? exampleHandles
              : undefined;
          if (!exampleMedia) {
            exampleMedia = Array.isArray(exampleUrls)
              ? exampleUrls[0]
              : typeof exampleUrls === 'string'
                ? exampleUrls
                : undefined;
          }
          const isBadCdn =
            typeof exampleMedia === 'string' && /scontent\.whatsapp\.net/.test(exampleMedia);
          const isHttp = typeof exampleMedia === 'string' && /^https?:\/\//.test(exampleMedia);
          if (typeof exampleMedia === 'string' && !isBadCdn) {
            const mediaKey = fmt === 'IMAGE' ? 'image' : fmt === 'VIDEO' ? 'video' : 'document';
            const mediaParam = { type: mediaKey };
            mediaParam[mediaKey] = {};
            if (isHttp) {
              mediaParam[mediaKey].exampleLink = exampleMedia;
            } else {
              mediaParam[mediaKey].exampleId = exampleMedia;
            }
            comps.push({ type: 'header', parameters: [mediaParam] });
          }
        }
      }
    }

    // BODY
    const body = (tpl.components || []).find((c) => c.type === 'BODY');
    if (body && typeof body.text === 'string') {
      const n = countPlaceholders(body.text);
      if (n > 0) {
        const vals = defaultParamValues(n);
        comps.push({ type: 'body', parameters: vals.map((v) => ({ type: 'text', text: v })) });
      }
    }

    // BUTTON URL params
    const buttons = (tpl.components || []).find((c) => c.type === 'BUTTONS');
    if (buttons && Array.isArray(buttons.buttons)) {
      buttons.buttons.forEach((btn, idx) => {
        if (
          (btn.type || '').toUpperCase() === 'URL' &&
          typeof btn.url === 'string' &&
          /\{\{\d+\}\}/.test(btn.url)
        ) {
          comps.push({
            type: 'button',
            sub_type: 'url',
            index: String(idx),
            parameters: [{ type: 'text', text: defaultParamValues(1)[0] }],
          });
        }
      });
    }

    return comps.length ? comps : undefined;
  };

  const handleTemplateSelect = (tpl) => {
    if (!tpl) return;
    // reset media state when switching templates
    clearMedia();

    setSelectedTemplateObj(tpl);
    setSelectedTemplateName(tpl.name || '');
    setSelectedTemplateLanguage(tpl.language || '');

    const headerFormat = getHeaderFormat(tpl);
    if (headerFormat && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerFormat)) {
      setMediaType(headerFormat);
    } else {
      setMediaType(null);
    }

    const bodyText = extractBodyText(tpl);
    setSelectedTemplate(bodyText);

    // preview by filling placeholders
    let preview = bodyText;
    const n = countPlaceholders(bodyText);
    const vals = defaultParamValues(n);
    vals.forEach((v, i) => {
      const re = new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g');
      preview = preview.replace(re, v);
    });
    setMessage(preview);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    // Validate media if required by template
    if (mediaType && !mediaFile) {
      setUploadError(`Please upload a ${mediaType.toLowerCase()} for this template`);
      return;
    }
    const comps = buildComponentsForTemplate(selectedTemplateObj);

    // Check if bulk mode
    if (Array.isArray(bulkPhoneNumbers) && bulkPhoneNumbers.length > 0) {
      onSendWhatsAppBulk?.(
        message,
        bulkPhoneNumbers,
        selectedTemplateName,
        selectedTemplateLanguage,
        comps,
        mediaFile
      );
    } else {
      onSendWhatsApp?.(
        message,
        customer?.phone,
        customer?.name,
        selectedTemplateName,
        selectedTemplateLanguage,
        comps,
        mediaFile
      );
    }
  };

  const handleClose = () => {
    setMessage('');
    setSelectedTemplate('');
    setSelectedTemplateObj(null);
    setSelectedTemplateName('');
    setSelectedTemplateLanguage('');
    // Clear media state
    clearMedia();
    setMediaType(null);
    onClose();
  };

  // File handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // Validate file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const allowedFormats = SUPPORTED_FORMATS[mediaType] || [];
    if (!allowedFormats.includes(fileExt)) {
      setUploadError(`Unsupported format. Allowed: ${allowedFormats.join(', ')}`);
      return;
    }

    const maxSize = MAX_FILE_SIZES[mediaType];
    if (file.size > maxSize) {
      setUploadError(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setMediaFile(file);

    // Create preview as Data URL for upload to backend
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setUploadError('');
  };

  const getMediaIcon = () => {
    switch (mediaType) {
      case 'IMAGE':
        return <ImageIcon size={20} />;
      case 'VIDEO':
        return <VideoIcon size={20} />;
      case 'DOCUMENT':
        return <FileIcon size={20} />;
      default:
        return <Upload size={20} />;
    }
  };

  const getAcceptFormats = () => {
    if (!mediaType) return '';
    return SUPPORTED_FORMATS[mediaType].join(',');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {bulkPhoneNumbers.length > 0
                    ? `Send WhatsApp to ${bulkPhoneNumbers.length} Customers`
                    : 'Send WhatsApp Message'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Media Upload Section */}
            {mediaType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Upload {mediaType} *
                </label>

                {!mediaFile ? (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {getMediaIcon()}
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {SUPPORTED_FORMATS[mediaType].join(', ')} (Max{' '}
                        {Math.round(MAX_FILE_SIZES[mediaType] / 1024 / 1024)}MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={getAcceptFormats()}
                      onChange={handleFileSelect}
                    />
                  </label>
                ) : (
                  <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
                    {mediaType === 'IMAGE' && mediaPreview && (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="mb-2 h-32 w-full rounded object-contain"
                      />
                    )}
                    {mediaType === 'VIDEO' && mediaPreview && (
                      <video src={mediaPreview} controls className="mb-2 h-32 w-full rounded" />
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMediaIcon()}
                        <span className="text-sm font-medium text-gray-700">{mediaFile.name}</span>
                      </div>
                      <button
                        onClick={clearMedia}
                        className="rounded p-1 text-red-600 transition-colors hover:bg-red-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {(mediaFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
              </motion.div>
            )}

            {/* Customer Info or Bulk Mode Info */}
            {bulkPhoneNumbers.length > 0 ? (
              <div className="mb-4 rounded-lg border-2 border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                    <Send size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bulk Send Mode</p>
                    <p className="text-sm text-gray-600">
                      Sending to {bulkPhoneNumbers.length} customers (1 sec delay between each)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              customer && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <span className="font-semibold text-purple-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Template Table */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Select Template</label>
                <input
                  type="text"
                  value={tplQuery}
                  onChange={(e) => setTplQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {tplError && (
                <div className="mb-2 rounded bg-red-50 p-2 text-sm text-red-700">{tplError}</div>
              )}

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-2">
                    {tplLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="text-gray-500">Loading templates...</div>
                      </div>
                    ) : (tpls || []).filter((t) => {
                        const q = tplQuery.toLowerCase();
                        return (
                          t.name?.toLowerCase().includes(q) ||
                          t.category?.toLowerCase().includes(q) ||
                          t.status?.toLowerCase().includes(q) ||
                          extractBodyText(t)?.toLowerCase().includes(q)
                        );
                      }).length === 0 ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="text-center">
                          <div className="mb-1 text-gray-400">No templates found</div>
                          <p className="text-xs text-gray-500">
                            Try adjusting your search criteria
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(tpls || [])
                          .filter((t) => {
                            const q = tplQuery.toLowerCase();
                            return (
                              t.name?.toLowerCase().includes(q) ||
                              t.category?.toLowerCase().includes(q) ||
                              t.status?.toLowerCase().includes(q) ||
                              extractBodyText(t)?.toLowerCase().includes(q)
                            );
                          })
                          .map((t) => (
                            <div
                              key={t.id}
                              className="rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-sm"
                            >
                              <div className="mb-2 flex items-start justify-between">
                                <div className="font-medium text-gray-900">{t.name}</div>
                                {(t.status || '').toUpperCase() === 'APPROVED' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-300" />
                                )}
                              </div>
                              <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                  {(t.language || '').toUpperCase()}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
                                    (t.status || '').toUpperCase() === 'APPROVED'
                                      ? 'border border-green-200 bg-green-50 text-green-700'
                                      : 'border border-amber-200 bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </div>
                              <div className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                Category
                              </div>
                              <div className="mb-2 text-sm text-gray-700">{t.category}</div>
                              <div className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                Preview
                              </div>
                              <p className="line-clamp-2 text-sm text-gray-600">
                                {extractBodyText(t)}
                              </p>
                              <button
                                onClick={() => handleTemplateSelect(t)}
                                className="mt-3 w-full rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                              >
                                Use
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Preview */}
            {/* todo: i have to come here and check it  */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message Preview
              </label>
              <motion.textarea
                key="whatsapp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                placeholder="Select a template to preview the message..."
                className="h-32 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                disabled={!selectedTemplateObj}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {message.length}/{maxLength} characters
                </span>
                <span
                  className={`text-xs ${
                    message.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  {maxLength - message.length} remaining
                </span>
              </div>
            </div>

            {/* Live Preview */}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  WhatsApp Preview
                </label>
                <div className="rounded-lg border-2 border-dashed border-green-200 bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <MessageSquare size={12} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap text-gray-700">{message}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={
                  !message.trim() || !selectedTemplateObj || isLoading || (mediaType && !mediaFile)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loaderPorps ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send size={16} />
                )}
                {bulkPhoneNumbers.length > 0
                  ? `Send to ${bulkPhoneNumbers.length} Customers`
                  : 'Send WhatsApp'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Table Skeleton Component
const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg bg-white p-4">
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-gray-300"></div>
            <div className="h-3 w-1/6 rounded bg-gray-300"></div>
          </div>
          <div className="hidden h-4 w-1/6 rounded bg-gray-300 md:block"></div>
          <div className="hidden h-4 w-1/8 rounded bg-gray-300 lg:block"></div>
          <div className="hidden h-4 w-1/8 rounded bg-gray-300 lg:block"></div>
          <div className="hidden h-4 w-1/8 rounded bg-gray-300 lg:block"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-gray-300"></div>
            <div className="h-8 w-8 rounded bg-gray-300"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkNumbersForModal, setBulkNumbersForModal] = useState([]);

  const { loading, error, data } = useGetCustomerDataFetch();
  const { store_id } = useAppData();
  const itemsPerPage = 10;

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!data) return;
    const mapped = (data || []).map((row) => ({
      id: row.id,
      name: row.customer_name || 'Unknown',
      phone: row.mobile_number || '',
      email: row.email || '',
      lastVisit: row.timestamp || row.created_at || null,
      totalVisits: row.total_visits ?? null,
      totalSpent: row.total_spent ?? null,
    }));

    setCustomers(mapped);
    setFilteredCustomers(mapped);
  }, [data]);

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchTerm, customers]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Selection helpers
  const isSelected = (id) => selectedIds.includes(id);
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const currentPageIds = currentCustomers.map((c) => c.id);
  const allSelectedOnPage =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const toggleSelectAllOnPage = () => {
    if (allSelectedOnPage) {
      // Clear only current page selections
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // Add all current page ids
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleViewProfile = (customer) => {
    setToast({
      message: `Opening profile for ${customer.name}`,
      type: 'success',
      isVisible: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSendWhatsApp = async (
    message,
    phoneNumber,
    name,
    templateName,
    templateLanguage,
    components,
    mediaFile
  ) => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('phoneNumber', phoneNumber);
    formData.append('name', name);
    formData.append('templateName', templateName);
    formData.append('templateLanguage', templateLanguage);

    if (components && components.length > 0) {
      formData.append('components', JSON.stringify(components));
    }

    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    // Add storeId for quota checking
    if (store_id) {
      formData.append('storeId', store_id);
    }

    try {
      setLoader(true);
      const { data, status } = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/sendMessage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (status === 200) {
        setToast({
          message: 'WhatsApp message sent successfully!',
          type: 'success',
          isVisible: true,
        });
        setIsMessageModalOpen(false);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Request failed';
      const err = e?.response?.data?.error;
      console.error('Send error:', err || msg);
      setToast({ message: `Failed: ${msg}`, type: 'error', isVisible: true });
    } finally {
      setLoader(false);
    }
  };

  const handleSendWhatsAppBulk = async (
    message,
    phoneNumbers,
    templateName,
    templateLanguage,
    components,
    mediaFile
  ) => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('phoneNumbers', JSON.stringify(phoneNumbers));
    formData.append('templateName', templateName);
    formData.append('templateLanguage', templateLanguage);

    // Add storeId for quota checking
    if (store_id) {
      formData.append('storeId', store_id);
    }

    // Only append components if it's defined and not empty
    if (components && components.length > 0) {
      formData.append('components', JSON.stringify(components));
    }

    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    try {
      setLoader(true);
      const { data, status } = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/messages/whatsapp/sendMessageBulk`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (status === 200) {
        const succ = data?.success ?? 0;
        const fail = data?.failed ?? 0;
        setToast({
          message: `Bulk WhatsApp: ${succ} sent, ${fail} failed (1 sec delay between each)`,
          type: fail > 0 ? 'error' : 'success',
          isVisible: true,
        });
        setIsMessageModalOpen(false);
        setBulkNumbersForModal([]);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Request failed';
      const err = e?.response?.data?.error;
      const quota = e?.response?.data?.quota;

      console.error('Bulk send error:', err || msg);

      // Show quota information if available
      if (quota) {
        setToast({
          message: `${msg} (${quota.remaining}/${quota.monthly_quota} messages remaining)`,
          type: 'error',
          isVisible: true,
        });
      } else {
        setToast({ message: `Bulk failed: ${msg}`, type: 'error', isVisible: true });
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your salon customers and their information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
              <Filter size={16} />
              Filters
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSelectAllOnPage}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                allSelectedOnPage
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle size={16} />
              {allSelectedOnPage ? 'Clear Selection (Page)' : 'Select All (Page)'}
            </motion.button>
            {selectedIds.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const phones = customers
                    .filter((c) => selectedIds.includes(c.id))
                    .map((c) => c.phone)
                    .filter(Boolean);
                  setSelectedCustomer(null);
                  setIsMessageModalOpen(true);
                  setBulkNumbersForModal(phones);
                }}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
              >
                <Send size={16} />
                Send WhatsApp to Selected ({selectedIds.length})
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-h-[60vh] overflow-y-auto rounded-xl bg-white shadow-lg"
        >
          {error && (
            <div className="mx-6 mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              Failed to load customers: {String(error)}
            </div>
          )}
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                        Select
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Last Visit
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Visits
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Total Spent
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected(customer.id)}
                            onChange={() => toggleSelect(customer.id)}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                              <span className="font-semibold text-purple-600">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            {customer.lastVisit ? formatDate(customer.lastVisit) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {customer.totalVisits ?? '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-green-500" />
                            <span className="font-semibold text-green-600">
                              {customer.totalSpent != null
                                ? formatCurrency(customer.totalSpent)
                                : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsMessageModalOpen(true);
                              }}
                              className="rounded-lg p-2 text-green-600 transition-colors hover:cursor-pointer hover:bg-green-50"
                              title="Send WhatsApp Message"
                            >
                              <MessageCircle size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 p-4 lg:hidden">
                {currentCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="rounded-lg bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected(customer.id)}
                          onChange={() => toggleSelect(customer.id)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-lg font-semibold text-purple-600">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsMessageModalOpen(true);
                          }}
                          className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                        >
                          <MessageCircle size={16} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Last Visit</p>
                        <p className="font-medium text-gray-900">
                          {customer.lastVisit ? formatDate(customer.lastVisit) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Visits</p>
                        <p className="font-medium text-gray-900">{customer.totalVisits ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Spent</p>
                        <p className="font-semibold text-green-600">
                          {customer.totalSpent != null ? formatCurrency(customer.totalSpent) : '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex w-full items-center justify-between overflow-x-auto border-t border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of{' '}
                    {filteredCustomers.length} customers
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <motion.button
                          key={i + 1}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                            currentPage === i + 1
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setBulkNumbersForModal([]);
          }}
          customer={selectedCustomer}
          onSendWhatsApp={handleSendWhatsApp}
          loaderPorps={loader}
          bulkPhoneNumbers={bulkNumbersForModal}
          onSendWhatsAppBulk={handleSendWhatsAppBulk}
        />

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;
