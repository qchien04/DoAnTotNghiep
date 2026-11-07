import React, { useState } from 'react';
import { Tabs, Input, Select, Button, Tag, Space } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  UserOutlined,
  SearchOutlined,
  SlidersOutlined,
} from '@ant-design/icons';

const { CheckableTag } = Tag;

export type SearchTab = 'rooms' | 'roommates';

export interface SearchFilters {
  tab: SearchTab;
  location: string;
  budget: string;
  gender: string;
  habits: string[];
}

interface RoomiSearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
  defaultTab?: SearchTab;
}

const DEFAULT_HABITS = [
  { id: 'pet-friendly', label: 'Pet-friendly', emoji: '🐶' },
  { id: 'late-sleeper', label: 'Late sleeper', emoji: '🌙' },
  { id: 'non-smoker', label: 'Non-smoker', emoji: '🚭' },
  { id: 'cooking-lover', label: 'Thích nấu ăn', emoji: '🍳' },
  { id: 'early-bird', label: 'Dậy sớm', emoji: '☀️' },
];

export const RoomiSearchBar: React.FC<RoomiSearchBarProps> = ({
  onSearch,
  className = '',
  defaultTab = 'roommates',
}) => {
  const [activeTab, setActiveTab] = useState<SearchTab>(defaultTab);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [gender, setGender] = useState('all');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['pet-friendly', 'non-smoker']);

  const toggleHabit = (id: string, checked: boolean) => {
    setSelectedHabits((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({
      tab: activeTab,
      location,
      budget,
      gender,
      habits: selectedHabits,
    });
  };

  const tabItems = [
    {
      key: 'roommates',
      label: 'Tìm bạn ở ghép (Roommates)',
    },
    {
      key: 'rooms',
      label: 'Tìm phòng trọ (Rooms)',
    },
  ];

  return (
    <div
      className={`bg-stay-card-bg rounded-2xl shadow-lg border border-stay-border p-4 sm:p-5 transition-colors ${className}`}
    >
      {/* Search Mode Tabs */}
      <div className="border-b border-stay-border mb-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as SearchTab)}
          items={tabItems}
          className="roomi-search-tabs"
        />
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Location Input */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-stay-text-secondary uppercase mb-1">
              Khu vực / Địa điểm
            </label>
            <Input
              prefix={<EnvironmentOutlined className="text-stay-primary" />}
              placeholder="VD: Cầu Giấy, Bách Khoa, Đống Đa..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 rounded-xl"
              allowClear
            />
          </div>

          {/* Budget Select */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-stay-text-secondary uppercase mb-1">
              Ngân sách / Người
            </label>
            <Select
              value={budget || undefined}
              onChange={(val) => setBudget(val)}
              placeholder="Chọn khoảng giá"
              className="w-full h-10 rounded-xl"
              suffixIcon={<DollarOutlined className="text-stay-primary" />}
              allowClear
              options={[
                { value: 'under-2m', label: 'Dưới 2 triệu / tháng' },
                { value: '2m-3.5m', label: '2.0 - 3.5 triệu / tháng' },
                { value: '3.5m-5m', label: '3.5 - 5.0 triệu / tháng' },
                { value: 'above-5m', label: 'Trên 5 triệu / tháng' },
              ]}
            />
          </div>

          {/* Gender Preference */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-stay-text-secondary uppercase mb-1">
              Giới tính bạn ở cùng
            </label>
            <Select
              value={gender}
              onChange={(val) => setGender(val)}
              className="w-full h-10 rounded-xl"
              suffixIcon={<UserOutlined className="text-stay-primary" />}
              options={[
                { value: 'all', label: 'Tất cả (Nam / Nữ)' },
                { value: 'male', label: 'Chỉ Nam' },
                { value: 'female', label: 'Chỉ Nữ' },
              ]}
            />
          </div>

          {/* Submit Search Button */}
          <div className="lg:col-span-2 pt-1 sm:pt-0">
            <label className="hidden lg:block text-xs font-semibold text-transparent mb-1">
              Tìm kiếm
            </label>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              className="w-full h-10 rounded-xl font-bold bg-stay-primary hover:bg-stay-primary-hover border-none flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Quick Filter Habit Tags */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-stay-text-secondary flex items-center gap-1 mr-1">
            <SlidersOutlined className="text-stay-primary" /> Tiêu chí ưu tiên:
          </span>
          <Space orientation="horizontal" size={[4, 6]} wrap>
            {DEFAULT_HABITS.map((item) => {
              const isChecked = selectedHabits.includes(item.id);
              return (
                <CheckableTag
                  key={item.id}
                  checked={isChecked}
                  onChange={(checked) => toggleHabit(item.id, checked)}
                  className={`text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors border ${isChecked
                    ? 'bg-stay-primary-subtle text-stay-primary border-stay-primary/30 font-semibold'
                    : 'bg-stay-bg-app text-stay-text-secondary border-stay-border hover:border-stay-primary/50'
                    }`}
                >
                  <span className="mr-1">{item.emoji}</span>
                  {item.label}
                </CheckableTag>
              );
            })}
          </Space>
        </div>
      </form>
    </div>
  );
};