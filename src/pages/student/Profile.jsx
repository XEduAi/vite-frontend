import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/api/auth/profile');
      const userData = res.data.user;
      setUser(userData);
      setFullName(userData.fullName || '');
      setPhone(userData.phone || '');
      setParentName(userData.parentInfo?.name || '');
      setParentPhone(userData.parentInfo?.phone || '');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await axiosClient.put('/api/auth/profile', {
        fullName,
        phone,
        parentInfo: { name: parentName, phone: parentPhone }
      });
      setProfileMsg(res.data.message);
      setUser(res.data.user);
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const res = await axiosClient.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 rounded-full" style={{ borderColor: 'var(--amber-warm)', borderTopColor: 'transparent' }} />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Tài khoản</div>
        <h1 className="bento-hero-title mt-2" style={{ color: 'var(--text-primary)' }}>
          Hồ sơ của tôi
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 card" style={{ padding: 4 }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`tab-pill flex-1 ${activeTab === 'profile' ? 'active' : ''}`}
          style={activeTab !== 'profile' ? { color: 'var(--text-secondary)' } : {}}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`tab-pill flex-1 ${activeTab === 'password' ? 'active' : ''}`}
          style={activeTab !== 'password' ? { color: 'var(--text-secondary)' } : {}}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bento-tile bento-tile-surface p-6">
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                @{user?.username}
              </div>
              <div className="text-xs px-2 py-0.5 rounded-md mt-1 inline-block font-semibold"
                   style={{ background: 'var(--olive-soft)', color: 'var(--olive)' }}>
                Học viên lớp {user?.grade}
              </div>
            </div>
          </div>

          {profileMsg && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{
              background: profileMsg.includes('thành công') ? 'var(--olive-soft)' : 'var(--terracotta-soft)',
              color: profileMsg.includes('thành công') ? 'var(--olive)' : 'var(--terracotta)'
            }}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
              />
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Thông tin phụ huynh
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Tên phụ huynh
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="input-field w-full px-4 py-2 rounded-xl"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    SĐT phụ huynh
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="input-field w-full px-4 py-2 rounded-xl"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-xl font-medium mt-4"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bento-tile bento-tile-surface p-6">
          <div className="bento-label mb-1">Bảo mật</div>
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Đổi mật khẩu
          </h2>

          {passwordMsg && (
            <div className="mb-4 p-3 rounded-lg text-sm"
                 style={{ background: 'var(--olive-soft)', color: 'var(--olive)' }}>
              {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-lg text-sm"
                 style={{ background: 'var(--terracotta-soft)', color: 'var(--terracotta)' }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full px-4 py-2 rounded-xl"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-xl font-medium mt-4"
            >
              Đổi mật khẩu
            </button>
          </form>
        </div>
      )}
    </div>
    </StudentLayout>
  );
};

export default Profile;
