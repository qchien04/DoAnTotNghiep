import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Upload,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Info,
  Building,
} from 'lucide-react';
import { message, Image, Spin } from 'antd';
import { landlordVerificationService } from '@/shared/services/landlordVerificationService';
import {
  LandlordVerificationResponse,
  LandlordVerificationType,
} from '@/shared/types/landlordVerification';
import { useAuthStore } from '@/stores/useAuthStore';
import { VerifiedLandlordBadge } from '@/shared/components';

export const LandlordVerificationPage: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<LandlordVerificationResponse | null>(null);
  const [showResubmitForm, setShowResubmitForm] = useState<boolean>(false);

  // Form states
  const [verificationType, setVerificationType] = useState<LandlordVerificationType>('OWNERSHIP_CERTIFICATE');
  const [propertyAddress, setPropertyAddress] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const data = await landlordVerificationService.getStatus();
      setVerificationData(data);
      if (data?.status === 'REJECTED') {
        setShowResubmitForm(false);
      }
    } catch (err: any) {
      console.error('Không thể tải trạng thái xác minh:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    const validFiles = newFiles.filter((file) => {
      const isImg = file.type.startsWith('image/');
      const isLt15M = file.size / 1024 / 1024 < 15;
      if (!isImg) {
        message.error(`Tệp ${file.name} không phải định dạng hình ảnh hợp lệ!`);
        return false;
      }
      if (!isLt15M) {
        message.error(`Tệp ${file.name} vượt quá 15MB!`);
        return false;
      }
      return true;
    });

    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);

    // Create object URLs for previews
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 ảnh chụp giấy tờ xác minh');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await landlordVerificationService.submitVerification({
        verificationType,
        propertyAddress: propertyAddress.trim(),
        documentNumber: documentNumber.trim(),
        notes: notes.trim(),
        files: selectedFiles,
      });

      message.success('Hồ sơ xác minh đã được gửi thành công! Quản trị viên sẽ sớm xét duyệt.');
      setVerificationData(res);
      setSelectedFiles([]);
      setFilePreviews([]);
      setShowResubmitForm(false);
      await fetchProfile();
    } catch (err: any) {
      message.error(err?.response?.data?.message || err.message || 'Không thể nộp hồ sơ xác minh');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Spin size="large" />
        <p className="mt-4 text-stay-text-secondary text-sm">Đang tải hồ sơ xác minh...</p>
      </div>
    );
  }

  const currentStatus = verificationData?.status || (user?.landlordVerified ? 'VERIFIED' : 'UNVERIFIED');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stay-border-subtle">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stay-text">Xác minh Danh tính Chủ trọ</h1>
            {currentStatus === 'VERIFIED' && <VerifiedLandlordBadge size="md" />}
          </div>
          <p className="text-sm text-stay-text-secondary mt-1">
            Cung cấp giấy tờ quyền sở hữu nhà đất hoặc hợp đồng ủy quyền để kích hoạt quyền đăng tin phòng trọ và nhận huy hiệu tín nhiệm.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg
            border border-stay-border text-stay-text-secondary hover:text-stay-text
            bg-stay-card-bg hover:bg-stay-bg-app transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* 1. Trạng thái ĐÃ XÁC MINH (VERIFIED) */}
      {currentStatus === 'VERIFIED' && (
        <div className="rounded-2xl p-6 md:p-8 bg-emerald-500/10 border border-emerald-500/30 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck size={36} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stay-text">Tài khoản đã được Xác minh Chủ trọ</h2>
                <VerifiedLandlordBadge size="sm" />
              </div>
              <p className="text-sm text-stay-text-secondary">
                Hồ sơ pháp lý nhà đất của bạn đã được Ban quản trị StayConnect xét duyệt hợp lệ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-emerald-500/20">
            <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border space-y-1">
              <span className="text-xs text-stay-text-muted">Trạng thái huy hiệu</span>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Đang hoạt động
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border space-y-1">
              <span className="text-xs text-stay-text-muted">Loại giấy tờ đã duyệt</span>
              <p className="text-sm font-semibold text-stay-text">
                {verificationData?.verificationTypeDisplay || 'Giấy tờ sở hữu nhà/đất'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border space-y-1">
              <span className="text-xs text-stay-text-muted">Quyền hạn đăng tin</span>
              <p className="text-sm font-semibold text-stay-text">Không giới hạn</p>
            </div>
          </div>

          {/* Danh sách ảnh tài liệu đã nộp */}
          {verificationData?.documents && verificationData.documents.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-stay-text">Ảnh giấy tờ lưu trữ bảo mật:</h3>
              <div className="flex flex-wrap gap-4">
                <Image.PreviewGroup>
                  {verificationData.documents.map((doc) => (
                    <div key={doc.id} className="relative group rounded-xl overflow-hidden border border-stay-border">
                      <Image
                        src={doc.viewUrl}
                        alt={doc.originalFilename}
                        className="w-32 h-24 object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white p-1 truncate text-center">
                        {doc.originalFilename}
                      </div>
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Trạng thái CHỜ DUYỆT (PENDING) */}
      {currentStatus === 'PENDING' && (
        <div className="rounded-2xl p-6 md:p-8 bg-amber-500/10 border border-amber-500/30 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock size={36} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stay-text">Hồ sơ xác minh đang chờ Quản trị viên xét duyệt</h2>
              <p className="text-sm text-stay-text-secondary">
                Ban quản trị StayConnect đang tiến hành đối soát hình ảnh giấy tờ của bạn. Quá trình thường diễn ra trong vòng 24 giờ làm việc.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-stay-text-muted block">Loại tài liệu đã nộp:</span>
                <span className="font-semibold text-stay-text">
                  {verificationData?.verificationTypeDisplay || 'Giấy tờ nhà đất'}
                </span>
              </div>
              {verificationData?.propertyAddress && (
                <div>
                  <span className="text-xs text-stay-text-muted block">Địa chỉ bất động sản:</span>
                  <span className="font-medium text-stay-text">{verificationData.propertyAddress}</span>
                </div>
              )}
              {verificationData?.documentNumber && (
                <div>
                  <span className="text-xs text-stay-text-muted block">Số hiệu giấy tờ:</span>
                  <span className="font-medium text-stay-text">{verificationData.documentNumber}</span>
                </div>
              )}
              {verificationData?.notes && (
                <div>
                  <span className="text-xs text-stay-text-muted block">Ghi chú gửi kèm:</span>
                  <span className="text-stay-text-secondary">{verificationData.notes}</span>
                </div>
              )}
            </div>

            {verificationData?.documents && verificationData.documents.length > 0 && (
              <div className="pt-3 border-t border-stay-border-subtle">
                <span className="text-xs text-stay-text-muted block mb-2">Tệp ảnh giấy tờ đã tải lên ({verificationData.documents.length} ảnh):</span>
                <div className="flex flex-wrap gap-3">
                  <Image.PreviewGroup>
                    {verificationData.documents.map((doc) => (
                      <div key={doc.id} className="relative rounded-lg overflow-hidden border border-stay-border">
                        <Image
                          src={doc.viewUrl}
                          alt={doc.originalFilename}
                          className="w-24 h-20 object-cover"
                        />
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-stay-text-muted italic">
              * Trong thời gian chờ duyệt, bạn tạm thời chưa thể đăng tin phòng trọ mới.
            </p>
            <button
              onClick={() => setShowResubmitForm(!showResubmitForm)}
              className="text-xs font-semibold text-stay-primary hover:underline cursor-pointer"
            >
              {showResubmitForm ? 'Thu gọn form nộp lại' : 'Cần cập nhật hoặc nộp lại giấy tờ?'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Trạng thái TỪ CHỐI (REJECTED) */}
      {currentStatus === 'REJECTED' && !showResubmitForm && (
        <div className="rounded-2xl p-6 md:p-8 bg-red-500/10 border border-red-500/30 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle size={36} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stay-text">Hồ sơ xác minh chưa được phê duyệt</h2>
              <p className="text-sm text-stay-text-secondary">
                Ban quản trị đã phản hồi yêu cầu bổ sung thông tin hoặc hình ảnh giấy tờ rõ ràng hơn.
              </p>
            </div>
          </div>

          {/* Lý do từ chối */}
          <div className="p-4 rounded-xl bg-stay-card-bg border border-red-500/30 space-y-2">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
              Lý do từ chối từ Ban Quản Trị:
            </span>
            <p className="text-sm text-stay-text font-medium bg-red-500/5 p-3 rounded-lg border border-red-500/20">
              {verificationData?.rejectionReason || user?.landlordRejectionReason || 'Giấy tờ chưa rõ ràng hoặc không hợp lệ.'}
            </p>
          </div>

          <button
            onClick={() => setShowResubmitForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white
              bg-stay-primary hover:bg-stay-primary-hover transition-colors shadow-sm cursor-pointer"
          >
            <Upload size={16} />
            Nộp lại hồ sơ xác minh mới
          </button>
        </div>
      )}

      {/* 4. Form nộp hồ sơ (UNVERIFIED hoặc khi click nộp lại) */}
      {(currentStatus === 'UNVERIFIED' || showResubmitForm) && (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl bg-stay-card-bg border border-stay-border space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-stay-text">
              {showResubmitForm ? 'Nộp lại Hồ sơ Xác minh' : 'Điền thông tin và Đính kèm Giấy tờ'}
            </h2>
            <p className="text-xs text-stay-text-secondary">
              Vui lòng cung cấp ảnh chụp giấy tờ rõ nét, thấy đầy đủ 4 góc, số hiệu, họ tên và con dấu đỏ.
            </p>
          </div>

          {/* Chọn loại giấy tờ */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stay-text block">
              Loại tài liệu xác minh <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setVerificationType('OWNERSHIP_CERTIFICATE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  verificationType === 'OWNERSHIP_CERTIFICATE'
                    ? 'border-stay-primary bg-stay-primary-subtle/50 text-stay-text'
                    : 'border-stay-border bg-stay-bg-app hover:border-stay-border-subtle text-stay-text-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    verificationType === 'OWNERSHIP_CERTIFICATE' ? 'bg-stay-primary text-white' : 'bg-stay-card-bg text-stay-text-muted'
                  }`}>
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stay-text">Giấy tờ sở hữu nhà/đất</h3>
                    <p className="text-xs text-stay-text-muted">Sổ đỏ, Sổ hồng đứng tên chính chủ</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setVerificationType('AUTHORIZATION_CONTRACT')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  verificationType === 'AUTHORIZATION_CONTRACT'
                    ? 'border-stay-primary bg-stay-primary-subtle/50 text-stay-text'
                    : 'border-stay-border bg-stay-bg-app hover:border-stay-border-subtle text-stay-text-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    verificationType === 'AUTHORIZATION_CONTRACT' ? 'bg-stay-primary text-white' : 'bg-stay-card-bg text-stay-text-muted'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stay-text">Hợp đồng ủy quyền</h3>
                    <p className="text-xs text-stay-text-muted">Văn bản ủy quyền quản lý/cho thuê có công chứng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Địa chỉ tài sản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stay-text">
                Địa chỉ bất động sản / Khu trọ
              </label>
              <input
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="VD: Số 15 ngõ 68 Triều Khúc, Thanh Xuân, Hà Nội"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stay-border bg-stay-bg-app text-stay-text placeholder:text-stay-text-muted text-sm focus:outline-none focus:border-stay-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stay-text">
                Số hiệu giấy tờ / Số hợp đồng
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="VD: GCN-HN-2023-8899 hoặc UQ-CG-2024"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stay-border bg-stay-bg-app text-stay-text placeholder:text-stay-text-muted text-sm focus:outline-none focus:border-stay-primary"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stay-text">
              Ghi chú thêm cho Ban Quản Trị
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập thông tin làm rõ thêm về quyền quản lý hoặc thông tin cơ sở trọ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stay-border bg-stay-bg-app text-stay-text placeholder:text-stay-text-muted text-sm focus:outline-none focus:border-stay-primary"
            />
          </div>

          {/* Khu vực Upload ảnh */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stay-text block">
              Tải lên ảnh giấy tờ xác minh <span className="text-red-500">*</span>
            </label>

            <div className="border-2 border-dashed border-stay-border hover:border-stay-primary rounded-2xl p-6 text-center bg-stay-bg-app/50 transition-colors">
              <input
                type="file"
                id="landlord-doc-upload"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="landlord-doc-upload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 mx-auto rounded-full bg-stay-primary-subtle text-stay-primary flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-stay-primary hover:underline">
                    Nhấn vào đây để chọn tệp
                  </span>{' '}
                  <span className="text-sm text-stay-text-secondary">hoặc kéo thả vào vùng này</span>
                </div>
                <p className="text-xs text-stay-text-muted">
                  Hỗ trợ JPG, PNG, WEBP (tối đa 15MB/ảnh, có thể chọn nhiều ảnh như Mặt trước, Mặt trong, Sơ đồ thửa đất)
                </p>
              </label>
            </div>

            {/* Danh sách ảnh xem trước */}
            {selectedFiles.length > 0 && (
              <div className="pt-3 space-y-2">
                <span className="text-xs font-semibold text-stay-text">
                  Các tệp đã chọn ({selectedFiles.length} ảnh):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filePreviews.map((previewUrl, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-stay-border bg-stay-bg-app">
                      <img
                        src={previewUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition-opacity"
                        title="Xóa ảnh này"
                      >
                        <X size={14} />
                      </button>
                      <div className="p-1.5 text-[10px] text-stay-text-muted truncate">
                        {selectedFiles[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quy chuẩn bảo mật */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-stay-bg-app border border-stay-border-subtle text-xs text-stay-text-secondary">
            <Info size={16} className="text-stay-primary shrink-0 mt-0.5" />
            <p>
              <strong>Cam kết bảo mật:</strong> Các tệp tài liệu nhà đất và hợp đồng của bạn được mã hóa và lưu trữ tại vùng dữ liệu riêng tư, không công khai lên sàn và chỉ được sử dụng cho mục đích thẩm định định danh của Ban Quản Trị StayConnect.
            </p>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stay-border-subtle">
            {showResubmitForm && (
              <button
                type="button"
                onClick={() => setShowResubmitForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-stay-text-secondary hover:text-stay-text bg-stay-bg-app border border-stay-border cursor-pointer"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-stay-primary hover:bg-stay-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spin size="small" />
                  <span>Đang tải lên hồ sơ...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Gửi hồ sơ xác minh</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
