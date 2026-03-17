import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import AdminLayout from '../../components/AdminLayout';
import { useDocumentAnalyticsQuery } from '../../features/documents/hooks';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

const CATEGORY_MAP = {
  'đề_thi': 'Đề thi',
  'tài_liệu': 'Tài liệu',
  'bài_giảng': 'Bài giảng',
  'sách': 'Sách',
  'khác': 'Khác',
};

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const DocumentAnalytics = () => {
  const analyticsQuery = useDocumentAnalyticsQuery();
  const data = analyticsQuery.data || null;
  const loading = analyticsQuery.isPending;

  const formatVND = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toLocaleString('vi-VN');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 shadow-lg" style={{ background: 'var(--cream)', border: '1px solid var(--border-light)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('vi-VN') : entry.value}
            {entry.name === 'Doanh thu' ? 'đ' : ''}
          </p>
        ))}
      </div>
    );
  };

  const PieLabelRenderer = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu phân tích...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {getApiErrorMessage(analyticsQuery.error, 'Không thể tải dữ liệu phân tích')}
          </p>
          <button
            onClick={() => analyticsQuery.refetch()}
            className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl mt-4"
          >
            Thử lại
          </button>
          <div>
          <Link to="/admin/documents" className="text-sm font-semibold mt-3 inline-block" style={{ color: 'var(--amber-warm)' }}>
            ← Quay lại Kho Tài Liệu
          </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const categoryData = (data.categoryBreakdown || []).map(item => ({
    ...item,
    name: CATEGORY_MAP[item.category] || item.category,
  }));

  const topDocs = (data.topDocuments || []).slice(0, 5);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            to="/admin/documents"
            className="flex items-center gap-1.5 text-xs font-semibold mb-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--amber-warm)' }}
          >
            <IconArrowLeft /> Quay lại Kho Tài Liệu
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Phân tích Kho Tài Liệu
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Thống kê doanh thu, lượt tải và xu hướng
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger-children">
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-2"
            style={{ background: '#d1fae5', color: '#10b981' }}>💰</div>
          <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {(data.totalRevenue || 0).toLocaleString('vi-VN')}đ
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tổng doanh thu</div>
        </div>
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-2"
            style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>📄</div>
          <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.totalDocuments || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tổng tài liệu</div>
        </div>
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-2"
            style={{ background: '#dbeafe', color: '#3b82f6' }}>⬇️</div>
          <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.totalDownloads || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tổng lượt tải</div>
        </div>
        <div className="card p-5 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mx-auto mb-2"
            style={{ background: '#ede9fe', color: '#8b5cf6' }}>🛒</div>
          <div className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.totalPurchases || 0}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tổng lượt mua</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Revenue Over Time */}
        <div className="card p-5 fade-in">
          <h3 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Doanh thu theo tháng
          </h3>
          {(data.monthlyRevenue || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={formatVND} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px]">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu doanh thu</p>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card p-5 fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Phân bố danh mục
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={40}
                  labelLine={false}
                  label={PieLabelRenderer}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} tài liệu`, name]}
                  contentStyle={{
                    background: 'var(--cream)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px]">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu danh mục</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Documents by Downloads */}
      {topDocs.length > 0 && (
        <div className="card p-5 mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Top 5 tài liệu được tải nhiều nhất
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topDocs} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <YAxis
                type="category"
                dataKey="title"
                width={160}
                tick={{ fontSize: 11 }}
                stroke="var(--text-muted)"
                tickFormatter={(value) => value.length > 25 ? value.substring(0, 25) + '...' : value}
              />
              <Tooltip
                formatter={(value) => [`${value} lượt tải`, 'Downloads']}
                contentStyle={{
                  background: 'var(--cream)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="downloads" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={28} name="Lượt tải" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Purchases Table */}
      {data.recentPurchases && data.recentPurchases.length > 0 && (
        <div className="card overflow-hidden fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--cream-warm)' }}>
            <h2 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>GIAO DỊCH GẦN ĐÂY</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream-warm)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Học viên', 'Tài liệu', 'Số tiền', 'Ngày mua'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentPurchases.map((purchase, idx) => (
                  <tr key={idx} className="border-b table-row" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
                          {(purchase.studentName || purchase.student?.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {purchase.studentName || purchase.student?.fullName || 'Ẩn danh'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {purchase.documentTitle || purchase.document?.title || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold" style={{ color: '#10b981' }}>
                        {(purchase.amount || purchase.price || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DocumentAnalytics;
