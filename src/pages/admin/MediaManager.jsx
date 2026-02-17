import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const MediaManager = () => {
  const [file, setFile] = useState(null);
  const [medias, setMedias] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách media khi mount
  useEffect(() => {
    fetchMedias();
  }, []);

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
    if (!file) {
      showMessage('Vui lòng chọn file để upload', 'error');
      return;
    }

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

      // Thêm file mới vào đầu danh sách
      setMedias([res.data.media, ...medias]);
      setFile(null);
      // Reset file input
      e.target.reset();
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

  const getTypeBadge = (type) => {
    const colors = {
      image: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      document: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Quản lý Media (R2 Storage)</h1>

      {/* Form Upload */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload File Mới</h2>
        <form onSubmit={handleUpload} className="flex gap-4 items-center flex-wrap">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
            className="block w-full max-w-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang upload...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </form>

        {/* Progress bar */}
        {uploading && (
          <div className="mt-3 w-full max-w-md">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        )}

        {message && (
          <p className={`mt-2 text-sm font-medium ${messageType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Danh sách media */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Danh sách Media</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-4">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Tên file</th>
                  <th className="px-4 py-2">Loại</th>
                  <th className="px-4 py-2">Media ID</th>
                  <th className="px-4 py-2">Ngày upload</th>
                  <th className="px-4 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {medias.map((media) => (
                  <tr key={media._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{media.title}</td>
                    <td className="px-4 py-2">{getTypeBadge(media.type)}</td>
                    <td className="px-4 py-2 font-mono text-xs bg-gray-50 select-all text-blue-600">
                      {media._id}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {media.createdAt ? new Date(media.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Xem
                      </a>
                      <button
                        onClick={() => handleDelete(media._id)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {medias.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                      Chưa có file nào được upload
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