import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoommatePosts, useMyRoom } from '@/shared/hooks';
import { Button, Form } from '@/shared/components';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { message } from 'antd';
import {
  CreatePostWithRoomDto,
  CreatePostWithoutRoomDto,
  RoommatePostType,
  LifestyleSurvey,
} from '@/shared/types/tenant';
import { PostTypeSelector } from './components/PostTypeSelector';
import { ExistingRoomSection } from './components/ExistingRoomSection';
import { VirtualRoomSection } from './components/VirtualRoomSection';
import { LifestyleFormValues } from './components/LifestyleSurveyTable';

export const CreateRoommatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { createPostWithRoom, isCreatingWithRoom, createPostWithoutRoom, isCreatingWithoutRoom } = useRoommatePosts();
  const { roomDetails } = useMyRoom();
  const [form] = Form.useForm();

  // Loại hình đăng tin: HAS_ROOM hoặc SEARCHING_ROOM
  const [postType, setPostType] = useState<RoommatePostType>('HAS_ROOM');

  // Nguồn phòng cho HAS_ROOM: CURRENT_ROOM (Phòng đang ở) hoặc NEW_ROOM (Phòng mới)
  const hasLinkedRoom = Boolean(roomDetails?.hasLinkedRoom && roomDetails?.room);
  const [roomOption, setRoomOption] = useState<'CURRENT_ROOM' | 'NEW_ROOM'>(
    hasLinkedRoom ? 'CURRENT_ROOM' : 'NEW_ROOM'
  );

  // Bản đồ bán kính tìm phòng (cho SEARCHING_ROOM)
  const [mapRadius, setMapRadius] = useState<number>(3.0);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0056, 105.8433]);
  const [landmarkAddress, setLandmarkAddress] = useState<string>('Trường Đại học Bách Khoa Hà Nội');

  // Khảo sát lối sống
  const [lifestyleValues, setLifestyleValues] = useState<LifestyleFormValues>({
    gender: 'Nam',
    genderImportance: 'Bắt buộc',
    occupation: 'Sinh viên / Đi làm',
    occupationImportance: 'Linh hoạt',
    sleepTime: 'Ngủ sau 23h, thức dậy 7h sáng',
    sleepTimeImportance: 'Tương đồng (không ồn ào đêm)',
    smoking: 'Hoàn toàn không hút thuốc',
    smokingImportance: 'Bắt buộc không hút thuốc',
    pet: 'Không nuôi thú cưng',
    petImportance: 'Ưu tiên không nuôi',
    cooking: 'Thường xuyên nấu ăn buổi tối',
    cookingImportance: 'Thoải mái cùng nấu',
    guest: 'Báo trước trước khi dẫn bạn về',
    guestImportance: 'Đồng thuận tôn trọng riêng tư',
  });

  const handleSelectType = (type: RoommatePostType) => {
    setPostType(type);
    if (type === 'HAS_ROOM') {
      if (roomOption === 'CURRENT_ROOM' && hasLinkedRoom && roomDetails?.room) {
        form.setFieldsValue({
          title: `Tìm bạn ở ghép phòng ${roomDetails.room.name} - ${roomDetails.room.buildingName || 'Tòa nhà'}`,
          sharePrice: Math.round((roomDetails.room.monthlyRent || 3800000) / 2),
          neededRoommates: 1,
        });
      }
    } else {
      form.setFieldsValue({
        title: 'Tìm 1-2 bạn sinh viên cùng lập nhóm tìm trọ quanh trường',
        sharePrice: 2000000,
        neededRoommates: 2,
      });
    }
  };

  const handleLandmarkChange = (val: string) => {
    setLandmarkAddress(val);
    const lower = val.toLowerCase();
    if (lower.includes('bách khoa') || lower.includes('kinh tế') || lower.includes('xây dựng')) {
      setMapCenter([21.0056, 105.8433]);
    } else if (lower.includes('cầu giấy') || lower.includes('quốc gia') || lower.includes('sư phạm')) {
      setMapCenter([21.0366, 105.7828]);
    } else if (lower.includes('đống đa') || lower.includes('ngân hàng')) {
      setMapCenter([21.0183, 105.8236]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (postType === 'HAS_ROOM') {
        const total = Number(values.totalRoomPrice || 3800000);
        const share = Number(values.sharePrice || 1900000);

        if (share > total) {
          message.error('Giá đóng góp mỗi người không được vượt quá tổng tiền thuê phòng gốc!');
          return;
        }

        const survey: LifestyleSurvey = {
          genderPreference: lifestyleValues.gender === 'Nam' ? 'MALE' : lifestyleValues.gender === 'Nữ' ? 'FEMALE' : 'ANY',
          sleepTime: lifestyleValues.sleepTime.includes('sau') ? 'AFTER_24H' : 'BEFORE_23H',
          smoking: lifestyleValues.smoking.includes('Có hút'),
          petFriendly: lifestyleValues.pet.includes('Có nuôi'),
          cookingFrequency: lifestyleValues.cooking.includes('Thường xuyên') ? 'DAILY' : 'SOMETIMES',
          cleanlinessLevel: 'VERY_CLEAN',
          personality: 'BALANCED',
          guestsAllowed: 'WEEKENDS_ONLY',
        };

        const isUsingCurrentRoom = roomOption === 'CURRENT_ROOM' && hasLinkedRoom;

        const payload: CreatePostWithRoomDto = {
          title: values.title,
          isExistingLinkedRoom: isUsingCurrentRoom,
          roomId: isUsingCurrentRoom ? roomDetails?.room?.id : undefined,
          roomAddress: values.roomAddress,
          ward: values.ward || values.district || 'Phường Bách Khoa',
          district: values.ward || values.district || 'Phường Bách Khoa',
          city: 'Thành phố Hà Nội',
          totalRoomPrice: total,
          sharePrice: share,
          neededRoommates: Number(values.neededRoommates || 1),
          amenities: isUsingCurrentRoom && roomDetails?.room?.amenities
            ? roomDetails.room.amenities
            : ['Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Kệ bếp'],
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
          ],
          lifestyle: survey,
          description: values.description || 'Phòng khép kín sạch sẽ, an ninh tốt, tìm bạn ở ghép văn minh.',
        };

        await createPostWithRoom(payload);
        message.success('Đăng bài tìm bạn ở ghép thành công! Tin của bạn đã hiển thị công khai.');
        navigate('/tenant/posts');
      } else {
        const survey: LifestyleSurvey = {
          genderPreference: 'ANY',
          sleepTime: 'BEFORE_23H',
          smoking: false,
          petFriendly: true,
          cookingFrequency: 'SOMETIMES',
          cleanlinessLevel: 'MODERATE',
          personality: 'BALANCED',
          guestsAllowed: 'ANYTIME',
        };

        const payload: CreatePostWithoutRoomDto = {
          title: values.title,
          centerAddress: landmarkAddress,
          latitude: mapCenter[0],
          longitude: mapCenter[1],
          radiusKm: mapRadius,
          budgetMax: Number(values.sharePrice || 2000000),
          neededRoommates: Number(values.neededRoommates || 2),
          lifestyle: survey,
          description: values.description || 'Cần tìm bạn cùng lập nhóm tìm trọ quanh trường.',
        };

        await createPostWithoutRoom(payload);
        message.success('Đăng bài tìm nhóm thành công! Tin tức đã được hiển thị trên bản đồ.');
        navigate('/tenant/posts');
      }
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Back Navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stay-text-secondary hover:text-stay-primary cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stay-text flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-stay-primary" />
          Đăng Bài Tìm Người Ở Cùng
        </h1>
        <p className="text-xs text-stay-text-secondary mt-0.5">
          Chọn đăng tìm bạn cho <strong>phòng bạn đang ở</strong> (tự động nạp thông tin) hoặc <strong>phòng mới</strong> (tự nhập địa chỉ, chi phí).
        </p>
      </div>

        {/* STEP 1: Loại hình đăng bài */}
        <PostTypeSelector postType={postType} onSelectType={handleSelectType} />

        <Form form={form} layout="vertical" className="space-y-6">
          {/* CASE 1: Đã có phòng */}
          {postType === 'HAS_ROOM' && (
            <ExistingRoomSection
              roomOption={roomOption}
              onRoomOptionChange={setRoomOption}
              currentRoom={roomDetails?.room}
              hasLinkedRoom={hasLinkedRoom}
              lifestyleValues={lifestyleValues}
              onLifestyleChange={setLifestyleValues}
              form={form}
            />
          )}

          {/* CASE 2: Chưa có phòng */}
          {postType === 'SEARCHING_ROOM' && (
            <VirtualRoomSection
              landmarkAddress={landmarkAddress}
              onLandmarkChange={handleLandmarkChange}
              mapRadius={mapRadius}
              onRadiusChange={setMapRadius}
              mapCenter={mapCenter}
            />
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stay-border">
            <Button variant="outline" size="md" onClick={() => navigate(-1)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={isCreatingWithRoom || isCreatingWithoutRoom}
              onClick={handleSubmit}
            >
              {postType === 'HAS_ROOM' ? 'Xuất bản bài đăng' : 'Đăng bài tìm nhóm'}
            </Button>
          </div>
        </Form>
      </div>
  );
};
