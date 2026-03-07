import { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const MediaManager = () => {
  const [file, setFile] = useState(null);
  const [medias, setMedias] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const formRef = useRef();

  useEffect(() => { fetchMedias(); }, []);

  const fetchMedias = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/media');
      setMedias(res.data.medias || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách media:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { showMessage('Vui lòng chọn file để upload', 'error'); return; }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      setUploadProgress(0);
      const res = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setMedias([res.data.media, ...medias]);
      setFile(null);
      if (formRef.current) formRef.current.reset();
      showMessage('Upload thành công!');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi upload file', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;
    try {
      await axiosClient.delete(`/media/${id}`);
      setMedias(medias.filter((m) => m._id !== id));
      showMessage('Đã xóa file thành công!');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi xóa file', 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const getTypeBadge = (type) => {
    const badgeMap = { image: 'badge-green', video: 'badge-purple', document: 'badge-amber' };
    return (
      <span className={`badge ${badgeMap[type] || 'badge-gray'}`}>
        {type}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return '📺';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Quản lý Tài nguyên</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{medias.length} file trong kho lưu trữ</p>
      </div>

      {/* Toast */}
      {message && (
        <div className={`toast mb-5 ${messageType === 'error' ? 'toast-error' : 'toast-success'}`}>
          {messageType === 'error' ? '⚠' : '✓'} {message}
        </div>
      )}

      {/* Upload area */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Upload File Mới</h2>
        <form ref={formRef} onSubmit={handleUpload}>
          {/* Drop zone */}
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center mb-4 cursor-pointer transition-all"
            style={{
              borderColor: dragOver ? 'var(--amber-warm)' : (file ? 'var(--amber-warm)' : 'var(--border)'),
              background: dragOver ? 'var(--amber-soft)' : (file ? 'var(--amber-soft)' : 'var(--cream-warm)'),
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-3xl mb-2">{file ? '📎' : '☁️'}</div>
            {file ? (
              <>
                <p className="text-sm font-medium" style={{ color: 'var(--amber-warm)' }}>{file.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Nhấn để đổi file
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Kéo thả file vào đây</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>hoặc nhấn để chọn file</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={uploading}
              className="hidden"
            />
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Đang upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <button type="submit" disabled={uploading || !file} className="btn-primary">
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang upload...
              </>
            ) : 'Upload File'}
          </button>
        </form>
      </div>

      {/* Media list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--cream-warm)' }}>
          <h2 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>DANH SÁCH FILE</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream-warm)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Tên file', 'Loại', 'Media ID', 'Ngày upload', 'Hành động'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {medias.map((media) => (
                  <tr
                    key={media._id}
                    className="border-b table-row"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(media.type)}</span>
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{media.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{getTypeBadge(media.type)}</td>
                    <td className="px-5 py-3.5">
                      <code
                        className="text-xs px-2 py-1 rounded-lg select-all"
                        style={{ background: 'var(--cream-warm)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}
                      >
                        {media._id}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {media.createdAt ? new Date(media.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={media.url} target="_blank" rel="noreferrer"
                          className="badge badge-blue"
                        >
                          Xem ↗
                        </a>
                        <button
                          onClick={() => handleDelete(media._id)}
                          className="badge badge-red cursor-pointer transition-opacity hover:opacity-80"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {medias.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center">
                      <div className="text-3xl mb-2">☁️</div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có file nào được upload</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MediaManager;
