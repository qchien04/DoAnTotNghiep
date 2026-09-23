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

interface StayConnectSearchBarProps {
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

export const StayConnectSearchBar: React.FC<StayConnectSearchBarProps> = ({
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
      key: 'rooms',
      label: <span className="font-semibold text-sm">Tìm phòng trọ</span>,
    },
    {
      key: 'roommates',
      label: <span className="font-semibold text-sm">Tìm bạn ở ghép</span>,
    },
  ];

  return (
    <div
      className={`bg-stay-card-bg rounded-2xl border border-stay-border shadow-search p-5 sm:p-6 transition-all ${className}`}
    >
      {/* Search Type Tabs with Antd Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as SearchTab)}
        items={tabItems}
        className="mb-3"
      />

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Inputs Row using Antd Input & Select */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Khu vực (Quận/Huyện) */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-stay-text">
              Khu vực (Quận/Huyện)
            </label>
            <Input
              size="large"
              prefix={<EnvironmentOutlined className="text-stay-primary" />}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Khu vực tìm kiếm (vd: Cầu Giấy, Bình Thạnh...)"
              className="rounded-xl border-stay-border hover:border-stay-primary focus:border-stay-primary"
            />
          </div>

          {/* Ngân sách/tháng */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-semibold text-stay-text">
              Ngân sách/tháng
            </label>
            <Input
              size="large"
              prefix={<DollarOutlined className="text-stay-secondary" />}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ngân sách (vd: 2 - 4 tr)"
              className="rounded-xl border-stay-border hover:border-stay-primary focus:border-stay-primary"
            />
          </div>

          {/* Giới tính */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-stay-text">
              Giới tính
            </label>
            <Select
              size="large"
              value={gender}
              onChange={setGender}
              className="w-full"
              suffixIcon={<UserOutlined className="text-stay-text-secondary" />}
              options={[
                { value: 'all', label: 'Tất cả giới tính' },
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' },
              ]}
            />
          </div>
        </div>

        {/* Habits Filter & Antd Search Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stay-text flex items-center gap-1.5">
              <SlidersOutlined className="text-stay-primary" />
              Bộ lọc thói quen:
            </span>
            <Space wrap size={6}>
              {DEFAULT_HABITS.map((habit) => (
                <CheckableTag
                  key={habit.id}
                  checked={selectedHabits.includes(habit.id)}
                  onChange={(checked) => toggleHabit(habit.id, checked)}
                  className={`text-xs py-1 px-3 rounded-lg border transition-all cursor-pointer ${
                    selectedHabits.includes(habit.id)
                      ? 'bg-stay-primary-subtle border-stay-primary text-stay-primary font-semibold'
                      : 'bg-stay-card-bg border-stay-border text-stay-text'
                  }`}
                >
                  <span className="mr-1">{habit.emoji}</span>
                  {habit.label}
                </CheckableTag>
              ))}
            </Space>
          </div>

          <div className="shrink-0 self-end sm:self-auto">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SearchOutlined />}
              className="bg-stay-primary hover:bg-stay-primary-hover px-6 font-semibold shadow-sm rounded-xl"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StayConnectSearchBar;
