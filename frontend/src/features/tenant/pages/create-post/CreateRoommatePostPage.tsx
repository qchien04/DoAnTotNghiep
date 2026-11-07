import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Gộp chức năng đăng bài vào Modal tại trang /tenant/posts?create=true
 */
export const CreateRoommatePostPage: React.FC = () => {
  return <Navigate to="/tenant/posts?create=true" replace />;
};
