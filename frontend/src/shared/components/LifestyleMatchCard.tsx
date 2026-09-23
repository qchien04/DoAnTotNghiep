import React from 'react';
import { Card, Avatar, Tag, Button, Space } from 'antd';
import {
  MessageOutlined,
  EnvironmentOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';

export interface RoommateProfile {
  id: string | number;
  name: string;
  age?: number;
  occupation?: string;
  location?: string;
  budget?: string;
  avatarUrl?: string;
  secondaryAvatars?: string[];
  matchPercentage: number;
  habits: {
    icon?: string;
    label: string;
  }[];
  bio?: string;
}

interface LifestyleMatchCardProps {
  profile: RoommateProfile;
  onViewProfile?: (profile: RoommateProfile) => void;
  onChat?: (profile: RoommateProfile) => void;
  className?: string;
}

export const LifestyleMatchCard: React.FC<LifestyleMatchCardProps> = ({
  profile,
  onViewProfile,
  onChat,
  className = '',
}) => {
  return (
    <Card
      hoverable
      className={`rounded-2xl border-stay-border bg-stay-card-bg shadow-card hover:shadow-search transition-all flex flex-col justify-between ${className}`}
      bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'between' }}
    >
      <div className="space-y-4">
        {/* Top Header: Avatars Group & Match Badge using Antd Avatar & Tag */}
        <div className="flex items-start justify-between gap-3">
          <Avatar.Group maxCount={3} size={48}>
            <Avatar
              src={profile.avatarUrl}
              style={{ backgroundColor: 'var(--stay-primary)' }}
            >
              {profile.name.charAt(0)}
            </Avatar>
            {profile.secondaryAvatars?.map((url, idx) => (
              <Avatar key={idx} src={url} />
            ))}
          </Avatar.Group>

          {/* 94% Match Tag */}
          <Tag
            color="var(--stay-match, #10B981)"
            icon={<ThunderboltFilled />}
            className="rounded-full px-3 py-1 text-xs font-bold border-none m-0 shadow-2xs"
          >
            {profile.matchPercentage}% Match
          </Tag>
        </div>

        {/* Profile Details */}
        <div>
          <h4 className="text-base font-bold text-stay-text hover:text-stay-primary transition-colors leading-snug">
            {profile.name}
            {profile.age && <span className="text-xs font-normal text-stay-text-muted ml-1.5">({profile.age}t)</span>}
          </h4>

          {profile.occupation && (
            <p className="text-xs text-stay-text-secondary font-medium mt-0.5">{profile.occupation}</p>
          )}

          {profile.location && (
            <div className="flex items-center gap-1 text-xs text-stay-text-secondary mt-1">
              <EnvironmentOutlined className="text-stay-primary" />
              <span>{profile.location}</span>
              {profile.budget && <span className="font-semibold text-stay-secondary ml-1">• {profile.budget}</span>}
            </div>
          )}
        </div>

        {/* Bio Quote */}
        {profile.bio && (
          <p className="text-xs text-stay-text-secondary line-clamp-2 leading-relaxed bg-stay-bg-app p-2.5 rounded-xl border border-stay-border-subtle">
            "{profile.bio}"
          </p>
        )}

        {/* Habits using Antd Tag */}
        <div className="pt-1">
          <p className="text-[11px] font-bold text-stay-text-muted uppercase tracking-wider mb-1.5">
            Thói quen sinh hoạt:
          </p>
          <Space wrap size={[6, 6]}>
            {profile.habits.map((habit, idx) => (
              <Tag
                key={idx}
                className="bg-stay-bg-app border-stay-border text-stay-text text-xs px-2.5 py-0.5 rounded-md m-0"
              >
                {habit.icon && <span className="mr-1">{habit.icon}</span>}
                <span>{habit.label}</span>
              </Tag>
            ))}
          </Space>
        </div>
      </div>

      {/* Action Button: Antd Button type="primary" */}
      <div className="pt-5 mt-4 border-t border-stay-border-subtle">
        <Button
          type="primary"
          block
          size="large"
          icon={<MessageOutlined />}
          onClick={() => {
            onChat?.(profile);
            onViewProfile?.(profile);
          }}
          className="bg-stay-primary hover:bg-stay-primary-hover font-medium rounded-xl shadow-xs"
        >
          Xem hồ sơ & Chat
        </Button>
      </div>
    </Card>
  );
};

export default LifestyleMatchCard;
