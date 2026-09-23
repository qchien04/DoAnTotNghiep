import React from 'react';
import { Card, Button, Statistic, Progress, Tag, Row, Col } from 'antd';
import {
  ShopOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
} from '@ant-design/icons';

interface LandlordDashboardPromoCardProps {
  onExploreClick?: () => void;
  className?: string;
}

export const LandlordDashboardPromoCard: React.FC<LandlordDashboardPromoCardProps> = ({
  onExploreClick,
  className = '',
}) => {
  return (
    <Card
      className={`rounded-3xl border-stay-border shadow-card bg-gradient-to-br from-stay-bg-app via-stay-card-bg to-stay-primary-subtle/30 p-2 sm:p-3 flex flex-col justify-between group ${className}`}
      bodyStyle={{ padding: 20 }}
    >
      <div className="space-y-4">
        {/* Header Tag */}
        <Tag
          color="blue"
          icon={<ShopOutlined />}
          className="rounded-full px-3 py-1 text-xs font-semibold text-stay-primary bg-stay-primary-subtle border-none m-0"
        >
          Dành Riêng Cho Chủ Nhà
        </Tag>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-stay-text tracking-tight">
            Dành riêng cho Chủ trọ
          </h3>
          <p className="text-xs text-stay-text-secondary leading-relaxed mt-1">
            Quản lý phòng cho thuê và kênh riêng Landlord dashboard. Tự động hóa hợp đồng và quản lý khách thuê hiệu quả.
          </p>
        </div>

        {/* Feature Checkmarks */}
        <div className="space-y-2 text-xs text-stay-text">
          <div className="flex items-center gap-2">
            <CheckCircleFilled className="text-stay-secondary" />
            <span>Xác thực tin đăng chính chủ miễn phí</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleFilled className="text-stay-secondary" />
            <span>Ký hợp đồng thuê trọ điện tử pháp lý</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleFilled className="text-stay-secondary" />
            <span>Theo dõi chỉ số thu chi điện nước online</span>
          </div>
        </div>

        {/* Mini Landlord OS Dashboard Preview using Antd Components */}
        <div className="rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs p-4 space-y-3 mt-2">
          <div className="flex items-center justify-between border-b border-stay-border-subtle pb-2">
            <span className="text-xs font-bold text-stay-text">StayConnect Landlord OS</span>
            <Tag color="green" className="m-0 text-[10px] border-none font-semibold">
              Live Demo
            </Tag>
          </div>

          <Row gutter={8} className="text-center">
            <Col span={8}>
              <div className="p-2 rounded-xl bg-stay-bg-app border border-stay-border-subtle">
                <Statistic
                  title={<span className="text-[10px] text-stay-text-muted">Lấp đầy</span>}
                  value="94%"
                  valueStyle={{ color: 'var(--stay-secondary)', fontSize: 16, fontWeight: 'bold' }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="p-2 rounded-xl bg-stay-bg-app border border-stay-border-subtle">
                <Statistic
                  title={<span className="text-[10px] text-stay-text-muted">Còn trống</span>}
                  value="02/30"
                  valueStyle={{ color: 'var(--stay-primary)', fontSize: 16, fontWeight: 'bold' }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="p-2 rounded-xl bg-stay-bg-app border border-stay-border-subtle">
                <Statistic
                  title={<span className="text-[10px] text-stay-text-muted">Hợp đồng</span>}
                  value="08"
                  valueStyle={{ color: '#F59E0B', fontSize: 16, fontWeight: 'bold' }}
                />
              </div>
            </Col>
          </Row>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-stay-text-secondary font-medium">
              <span>Tỷ lệ hoàn thành mục tiêu năm</span>
              <span className="text-stay-secondary font-bold">94%</span>
            </div>
            <Progress percent={94} strokeColor="var(--stay-secondary, #16A34A)" size="small" showInfo={false} />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-5 mt-2">
        <Button
          type="primary"
          block
          size="large"
          iconPosition="end"
          icon={<ArrowRightOutlined />}
          onClick={onExploreClick}
          className="bg-stay-primary hover:bg-stay-primary-hover font-semibold rounded-xl shadow-xs"
        >
          Quản lý hợp đồng
        </Button>
      </div>
    </Card>
  );
};

export default LandlordDashboardPromoCard;
