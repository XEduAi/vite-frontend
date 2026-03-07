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
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Tài khoản của tôi
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: activeTab === 'profile' ? 'var(--amber-warm)' : 'var(--bg-secondary)',
            color: activeTab === 'profile' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: activeTab === 'password' ? 'var(--amber-warm)' : 'var(--bg-secondary)',
            color: activeTab === 'password' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                @{user?.username}
              </div>
              <div className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                Học viên {user?.grade}
              </div>
            </div>
          </div>

          {profileMsg && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
              background: profileMsg.includes('thành công') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: profileMsg.includes('thành công') ? 'var(--green)' : '#ef4444'
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
        <div className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Đổi mật khẩu
          </h2>

          {passwordMsg && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
              background: 'rgba(34,197,94,0.1)',
              color: 'var(--green)'
            }}>
              {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ 
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444'
            }}>
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
