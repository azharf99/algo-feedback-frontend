import React from 'react'
import { useTranslation } from 'react-i18next'
import { StatusFilterValue } from '../../types/data'

interface StatusFilterProps {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
}

// Toggle dropdown untuk memfilter data berdasarkan status (Active / Inactive / All).
// Dipakai di semua halaman list yang datanya punya field status (is_active atau status).
const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const { t } = useTranslation()

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as StatusFilterValue)}
      aria-label={t('filter_status')}
      title={t('filter_status')}
      className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
    >
      <option value="active">{t('active')}</option>
      <option value="inactive">{t('inactive')}</option>
      <option value="all">{t('filter_status_all')}</option>
    </select>
  )
}

export default StatusFilter
