"use client";

// PKI Navigation Item Component
// Navigation link for PKI dashboard

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PKINavItem() {
  return (
    <Link
      href="/pki-dashboard"
      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
    >
      <Shield className="w-4 h-4" />
      <span>PKI Management</span>
    </Link>
  );
}
