import React from 'react';

export default function AdminPortal() {
  return (
    <iframe
      title="MineGuard AI administration portal"
      src="/authentication-admin/mine-frontpage/index.html"
      style={{
        border: 0,
        display: 'block',
        height: '100vh',
        width: '100%',
      }}
    />
  );
}