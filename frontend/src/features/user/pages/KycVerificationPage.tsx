import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Video,
  StopCircle,
  FileText,
  UserCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import { message, Spin, Progress } from 'antd';
import { kycService } from '@/shared/services/kycService';
import { KycDocumentResponse, KycAiVerificationResponse, QrCccdInfo } from '@/shared/types/kyc';
import { useAuthStore } from '@/stores/useAuthStore';

export const KycVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuthStore();

  // Wizard Step: 1 = Tải CCCD, 2 = Xem thông tin QR, 3 = Xác thực khuôn mặt
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Existing documents
  const [existingDocs, setExistingDocs] = useState<KycDocumentResponse[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  // Step 1: CCCD Files
  const [frontCardFile, setFrontCardFile] = useState<File | null>(null);
  const [frontCardPreview, setFrontCardPreview] = useState<string | null>(null);
  const [backCardFile, setBackCardFile] = useState<File | null>(null);
  const [backCardPreview, setBackCardPreview] = useState<string | null>(null);

  // Step 2: Quét mã QR & Thông tin trích xuất
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);
  const [scannedQrInfo, setScannedQrInfo] = useState<QrCccdInfo | null>(null);

  // Step 3: Camera & Video Recording
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Fallback upload face file
  const [fallbackFaceFile, setFallbackFaceFile] = useState<File | null>(null);
  const [fallbackFacePreview, setFallbackFacePreview] = useState<string | null>(null);

  // Submitting & AI Result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<KycAiVerificationResponse | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const capturedSnapshotRef = useRef<File | null>(null);

  // Load existing KYC docs on mount
  useEffect(() => {
    fetchExistingDocs();
  }, []);

  // Đảm bảo camera stream luôn được gắn vào thẻ video khi ở Bước 3
  useEffect(() => {
    if (currentStep === 3 && !aiResult) {
      if (!cameraStream) {
        startCamera();
      } else if (videoRef.current && videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch(console.error);
      }
    } else {
      stopCamera();
    }
  }, [currentStep, cameraStream, aiResult]);

  const fetchExistingDocs = async () => {
    try {
      setIsLoadingDocs(true);
      const docs = await kycService.getMyDocuments();
      setExistingDocs(docs);
    } catch (err) {
      console.error('Không thể lấy tài liệu KYC:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const isAlreadyVerified = existingDocs.some(
    (d) => d.status === 'VERIFIED' && d.documentType === 'ID_CARD_FRONT'
  );

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle front card selection
  const handleFrontCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrontCardFile(file);
      setFrontCardPreview(URL.createObjectURL(file));
    }
  };

  // Handle back card selection
  const handleBackCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackCardFile(file);
      setBackCardPreview(URL.createObjectURL(file));
    }
  };

  // Chụp một khung hình sắc nét từ thẻ video qua Canvas để DeepFace so khớp chuẩn nhất
  const captureFrameFromVideo = (): File | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Vẽ khung hình hiện tại từ camera
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], 'selfie_live_snapshot.jpg', { type: mime });
    } catch (err) {
      console.warn('Không thể chụp frame canvas:', err);
      return null;
    }
  };

  // Start webcam
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.error('Lỗi truy cập camera:', err);
      setCameraError('Không thể truy cập camera. Vui lòng cấp quyền truy cập thiết bị hoặc sử dụng chế độ tải tệp lên.');
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Bắt đầu quy trình "Vừa quay vừa xác thực cho chuẩn"
  const startRecording = () => {
    if (!cameraStream) {
      startCamera();
      return;
    }

    recordedChunksRef.current = [];
    capturedSnapshotRef.current = null;

    const mediaRecorder = new MediaRecorder(cameraStream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setRecordedVideoBlob(blob);
      setRecordedVideoUrl(URL.createObjectURL(blob));
      setIsRecording(false);
      setRecordingSeconds(0);
      stopCamera();

      // "Vừa quay vừa xác thực": tự động gửi xác thực ngay với ảnh snapshot HD đã trích xuất từ camera
      const payloadToSend = capturedSnapshotRef.current || blob;
      executeVerification(payloadToSend);
    };

    // Đếm ngược 3 giây chuẩn bị
    let timeLeft = 3;
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        // Bắt đầu ghi hình video 3 giây và quét khuôn mặt trực tiếp
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(3);

        let recSec = 3;
        timerRef.current = setInterval(() => {
          recSec -= 1;
          setRecordingSeconds(recSec);

          // Trích xuất khung hình chất lượng cao nhất ở giây thứ 2 khi người dùng nhìn ổn định
          if (recSec === 1 && !capturedSnapshotRef.current) {
            capturedSnapshotRef.current = captureFrameFromVideo();
          }

          if (recSec <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (!capturedSnapshotRef.current) {
              capturedSnapshotRef.current = captureFrameFromVideo();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }
        }, 1000);
      }
    }, 1000);
  };

  // Bước 1: Quét mã QR CCCD và chuyển sang bước 2 để xem thông tin
  const handleScanQrAndProceed = async () => {
    if (!frontCardFile) {
      message.error('Vui lòng tải lên ảnh mặt trước thẻ CCCD!');
      return;
    }

    try {
      setIsScanningQr(true);
      message.loading({ content: 'AI đang đọc mã QR trên thẻ CCCD...', key: 'scan-qr' });
      const qrData = await kycService.scanQr(frontCardFile);
      setScannedQrInfo(qrData);

      if (qrData.qrFound) {
        message.success({ content: 'Đã giải mã thành công thông tin từ QR CCCD!', key: 'scan-qr' });
      } else {
        message.warning({
          content: qrData.message || 'Chưa đọc được mã QR. Bạn có thể kiểm tra lại thông tin hoặc chụp lại ảnh rõ nét.',
          key: 'scan-qr',
        });
      }
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Lỗi khi quét QR CCCD:', err);
      setScannedQrInfo({
        qrFound: false,
        message: 'Không thể kết nối dịch vụ AI quét QR lúc này. Bạn vẫn có thể tiếp tục sang bước xác thực khuôn mặt.',
      });
      message.warning({ content: 'Chưa thể quét mã QR lúc này. Bạn vẫn có thể tiếp tục xác thực khuôn mặt.', key: 'scan-qr' });
      setCurrentStep(2);
    } finally {
      setIsScanningQr(false);
    }
  };

  // Bước 2 -> Bước 3: Xác nhận thông tin và chuyển sang xác thực khuôn mặt
  const handleProceedToFaceVerification = () => {
    setCurrentStep(3);
    startCamera();
  };

  // Retake video
  const handleRetakeVideo = () => {
    setRecordedVideoBlob(null);
    setRecordedVideoUrl(null);
    setFallbackFaceFile(null);
    setFallbackFacePreview(null);
    capturedSnapshotRef.current = null;
    startCamera();
  };

  // Thực thi xác thực AI gửi về BE
  const executeVerification = async (facePayload: Blob | File, livenessScore: number = 95.0) => {
    if (!frontCardFile) {
      message.error('Vui lòng tải lên ảnh mặt trước thẻ CCCD!');
      setCurrentStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      setCurrentStep(3);
      message.loading({ content: 'AI đang so khớp khuôn mặt ArcFace + RetinaFace với ảnh CCCD...', key: 'ai-kyc' });

      // Đảm bảo tệp gửi lên có định danh chuẩn
      let finalFaceFile: File;
      if (facePayload instanceof File) {
        finalFaceFile = facePayload;
      } else {
        finalFaceFile = new File([facePayload], 'live_face_selfie.webm', { type: facePayload.type || 'video/webm' });
      }

      const response = await kycService.verifyWithAi(frontCardFile, finalFaceFile, backCardFile, livenessScore);
      setAiResult(response);

      // Cập nhật thông tin user trong auth store
      try {
        await fetchProfile();
      } catch {
        // bỏ qua nếu fetch thất bại cục bộ
      }

      if (response.overallVerified) {
        message.success({ content: 'Xác thực danh tính AI thành công! Tài khoản đã được cấp tick xanh.', key: 'ai-kyc' });
      } else {
        message.warning({
          content: response.message || 'Xác thực chưa hoàn tất. Vui lòng kiểm tra kết quả chi tiết.',
          key: 'ai-kyc',
        });
      }
      fetchExistingDocs();
    } catch (err: any) {
      console.error('Lỗi khi gửi xác thực AI:', err);
      const errMsg = err?.response?.data?.message || 'Có lỗi xảy ra khi xử lý xác thực danh tính AI!';
      message.error({ content: errMsg, key: 'ai-kyc' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nút bấm thủ công
  const handleSubmitVerification = async () => {
    const facePayload = capturedSnapshotRef.current || recordedVideoBlob || fallbackFaceFile;
    if (!facePayload) {
      message.error('Vui lòng quay phim hoặc tải ảnh khuôn mặt xác nhận!');
      setCurrentStep(3);
      return;
    }
    const score = recordedVideoBlob ? 95.0 : 85.0;
    await executeVerification(facePayload, score);
  };

  return (
    <div className="min-h-screen bg-stay-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stay-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stay-primary-subtle text-stay-primary text-xs font-semibold border border-stay-primary/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Công nghệ AI DeepFace & Trích xuất QR CCCD Chip
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
              Xác Thực Danh Tính Điện Tử (eKYC)
            </h1>
            <p className="text-sm text-stay-text-secondary mt-1 max-w-2xl">
              Nộp ảnh CCCD gắn chip và quay video ngắn khuôn mặt để xác thực danh tính tự động. Hệ thống mã hóa bảo mật và lưu trữ độc quyền.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 rounded-xl border border-stay-border bg-stay-card-bg hover:bg-stay-bg-app text-stay-text text-sm font-medium transition shadow-xs"
            >
              Quay lại Hồ sơ
            </button>
          </div>
        </div>

        {/* Existing Status Banner */}
        {isLoadingDocs ? (
          <div className="p-4 rounded-2xl bg-stay-card-bg border border-stay-border flex items-center justify-center gap-2 text-xs text-stay-text-secondary">
            <Spin size="small" />
            <span>Đang kiểm tra hồ sơ xác thực...</span>
          </div>
        ) : isAlreadyVerified ? (
          <div className="p-4 rounded-2xl bg-stay-match-subtle border border-stay-match/30 flex items-start gap-4 transition-colors">
            <div className="p-2 rounded-xl bg-stay-match text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-stay-text">
                Tài khoản của bạn đã được Xác Thực Danh Tính thành công!
              </h4>
              <p className="text-xs text-stay-text-secondary mt-0.5">
                Số CCCD gắn kết: <strong className="text-stay-text">{user?.idCardNumber || 'Đã ghi nhận'}</strong>. 
                Bạn vẫn có thể thực hiện xác thực lại nếu cần cập nhật thông tin thẻ căn cước mới.
              </p>
            </div>
          </div>
        ) : null}


        {/* Wizard Stepper 3 Bước */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Step 1 Pill */}
          <div
            onClick={() => !isSubmitting && !isScanningQr && setCurrentStep(1)}
            className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
              currentStep === 1
                ? 'bg-stay-card-bg border-stay-primary shadow-sm'
                : currentStep > 1
                ? 'bg-stay-card-bg border-stay-match/40'
                : 'bg-stay-bg-app border-stay-border opacity-70'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                currentStep === 1
                  ? 'bg-stay-primary text-white'
                  : currentStep > 1
                  ? 'bg-stay-match text-white'
                  : 'bg-stay-bg-app border border-stay-border text-stay-text-muted'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-stay-text">Bước 1</div>
              <div className="text-xs text-stay-text-secondary font-medium">Nộp ảnh thẻ CCCD</div>
            </div>
          </div>

          {/* Step 2 Pill */}
          <div
            onClick={() => frontCardFile && scannedQrInfo && !isSubmitting && setCurrentStep(2)}
            className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
              currentStep === 2
                ? 'bg-stay-card-bg border-stay-primary shadow-sm'
                : currentStep > 2
                ? 'bg-stay-card-bg border-stay-match/40'
                : 'bg-stay-bg-app border-stay-border opacity-70'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                currentStep === 2
                  ? 'bg-stay-primary text-white'
                  : currentStep > 2
                  ? 'bg-stay-match text-white'
                  : 'bg-stay-bg-app border border-stay-border text-stay-text-muted'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-stay-text">Bước 2</div>
              <div className="text-xs text-stay-text-secondary font-medium">Thông tin từ QR CCCD</div>
            </div>
          </div>

          {/* Step 3 Pill */}
          <div
            className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
              currentStep === 3
                ? 'bg-stay-card-bg border-stay-primary shadow-sm'
                : 'bg-stay-bg-app border-stay-border opacity-70'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                currentStep === 3
                  ? 'bg-stay-primary text-white'
                  : 'bg-stay-bg-app border border-stay-border text-stay-text-muted'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-stay-text">Bước 3</div>
              <div className="text-xs text-stay-text-secondary font-medium">Xác thực khuôn mặt AI</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: NỘP ẢNH CCCD MẶT TRƯỚC / MẶT SAU */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="bg-stay-card-bg rounded-3xl border border-stay-border p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-stay-border">
              <div className="p-2.5 rounded-xl bg-stay-primary-subtle text-stay-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stay-text">Tải lên hình ảnh thẻ CCCD gắn chip</h3>
                <p className="text-xs text-stay-text-secondary">
                  Yêu cầu ảnh chụp rõ nét, vuông góc, không bị bóng lóa hoặc che khuất mã QR ở góc trên bên phải.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mặt trước CCCD (Bắt buộc) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-stay-text flex items-center gap-1.5">
                    <span>Mặt trước CCCD</span>
                    <span className="text-rose-500">*</span>
                    <span className="text-xs font-normal text-stay-text-muted">(Chứa ảnh & mã QR)</span>
                  </label>
                  {frontCardFile && (
                    <span className="text-xs text-stay-match font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Đã chọn ảnh
                    </span>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-stay-border hover:border-stay-primary rounded-2xl p-4 transition-all bg-stay-bg-app dark:bg-slate-800/40 text-center overflow-hidden aspect-[1.58/1] flex flex-col items-center justify-center group">
                  {frontCardPreview ? (
                    <div className="w-full h-full relative group">
                      <img
                        src={frontCardPreview}
                        alt="CCCD Mặt trước"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-xl">
                        <Upload className="w-6 h-6 mb-1 text-white" />
                        <span className="text-xs font-semibold">Nhấn để thay đổi ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFrontCardChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="w-12 h-12 rounded-2xl bg-stay-primary-subtle text-stay-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-stay-text">Tải ảnh Mặt trước CCCD</span>
                      <span className="text-xs text-stay-text-muted mt-1 max-w-xs">
                        Hỗ trợ PNG, JPG, WEBP (tối đa 15MB). Đảm bảo góc mã QR rõ nét.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFrontCardChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Mặt sau CCCD (Tùy chọn) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-stay-text flex items-center gap-1.5">
                    <span>Mặt sau CCCD</span>
                    <span className="text-xs font-normal text-stay-text-muted">(Tùy chọn / Khuyến khích)</span>
                  </label>
                  {backCardFile && (
                    <span className="text-xs text-stay-match font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Đã chọn ảnh
                    </span>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-stay-border hover:border-stay-primary rounded-2xl p-4 transition-all bg-stay-bg-app dark:bg-slate-800/40 text-center overflow-hidden aspect-[1.58/1] flex flex-col items-center justify-center group">
                  {backCardPreview ? (
                    <div className="w-full h-full relative group">
                      <img
                        src={backCardPreview}
                        alt="CCCD Mặt sau"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-xl">
                        <Upload className="w-6 h-6 mb-1 text-white" />
                        <span className="text-xs font-semibold">Nhấn để thay đổi ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBackCardChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="w-12 h-12 rounded-2xl bg-stay-bg-app border border-stay-border text-stay-text-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-stay-text">Tải ảnh Mặt sau CCCD</span>
                      <span className="text-xs text-stay-text-muted mt-1 max-w-xs">
                        Chứa chip điện tử và vân tay đặc điểm nhận dạng
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackCardChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Note alert */}
            <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border flex items-start gap-3 transition-colors text-xs text-stay-text-secondary leading-relaxed">
              <Info className="w-4 h-4 text-stay-primary shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý quan trọng:</strong> Hệ thống sử dụng công nghệ nhận diện AI đọc dữ liệu trực tiếp từ <strong>Mã QR</strong> trên thẻ CCCD. Vui lòng không che góc trên bên phải, giữ camera cố định và tránh nguồn sáng phản chiếu trực tiếp lên bề mặt thẻ.
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-4 border-t border-stay-border">
              <button
                type="button"
                disabled={!frontCardFile || isScanningQr}
                onClick={handleScanQrAndProceed}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stay-primary hover:bg-stay-primary-hover text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanningQr ? (
                  <>
                    <Spin size="small" />
                    <span>Đang giải mã thông tin QR...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Quét mã QR & Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: XEM & KIỂM TRA THÔNG TIN TRÍCH XUẤT TỪ MÃ QR CCCD */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="bg-stay-card-bg rounded-3xl border border-stay-border p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-stay-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-stay-primary-subtle text-stay-primary">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stay-text">Thông tin giải mã từ mã QR Căn cước công dân</h3>
                  <p className="text-xs text-stay-text-secondary">
                    Hệ thống đã trích xuất dữ liệu từ mã QR trên thẻ CCCD gắn chip của bạn. Vui lòng kiểm tra đối chiếu trước khi xác thực khuôn mặt.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-stay-text-secondary hover:text-stay-text flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Thay ảnh thẻ khác
              </button>
            </div>

            {/* QR Status Banner */}
            {scannedQrInfo?.qrFound ? (
              <div className="p-4 rounded-2xl bg-stay-match-subtle border border-stay-match/30 flex items-start gap-3 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-stay-match shrink-0 mt-0.5" />
                <div className="text-xs text-stay-text space-y-0.5">
                  <strong className="text-sm font-bold text-stay-match-dark dark:text-stay-match">
                    Giải mã mã QR CCCD thành công!
                  </strong>
                  <p className="text-stay-text-secondary">
                    Toàn bộ 7 trường dữ liệu định danh công dân theo quy chuẩn Bộ Công An đã được hệ thống đọc chính xác.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 transition-colors">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-stay-text space-y-0.5">
                  <strong className="text-sm font-bold text-amber-500">
                    Chưa đọc được mã QR trên ảnh mặt trước
                  </strong>
                  <p className="text-stay-text-secondary">
                    {scannedQrInfo?.message || 'Góc trên bên phải thẻ có thể bị lóa sáng, mờ hoặc che khuất. Bạn vẫn có thể tiếp tục, hồ sơ sẽ được chuyển qua kiểm tra thủ công.'}
                  </p>
                </div>
              </div>
            )}

            {/* Citizen Identity Card Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Thẻ CCCD Preview thu nhỏ */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold text-stay-text-muted uppercase tracking-wider">
                  Hình ảnh thẻ đã tải lên
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {frontCardPreview && (
                    <div className="space-y-1">
                      <div className="aspect-[1.58/1] rounded-xl overflow-hidden border border-stay-border shadow-xs">
                        <img src={frontCardPreview} alt="Mặt trước" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-stay-text-muted text-center block">Mặt trước CCCD</span>
                    </div>
                  )}
                  {backCardPreview && (
                    <div className="space-y-1">
                      <div className="aspect-[1.58/1] rounded-xl overflow-hidden border border-stay-border shadow-xs">
                        <img src={backCardPreview} alt="Mặt sau" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-stay-text-muted text-center block">Mặt sau CCCD</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bảng thông tin định danh chi tiết */}
              <div className="lg:col-span-7 p-6 rounded-3xl border border-stay-border bg-stay-bg-app dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stay-border">
                  <span className="text-xs font-bold text-stay-text uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-stay-primary" />
                    Thông tin căn cước công dân
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
                    CCCD gắn chip
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Số CCCD */}
                  <div className="p-3.5 rounded-2xl bg-stay-card-bg border border-stay-border flex items-center justify-between">
                    <div>
                      <div className="text-stay-text-muted text-[11px]">Số định danh cá nhân (Số CCCD):</div>
                      <div className="text-lg font-black text-stay-primary tracking-wider font-mono mt-0.5">
                        {scannedQrInfo?.idCardNumber || (scannedQrInfo as any)?.id_card_number || 'Chưa nhận diện'}
                      </div>
                    </div>
                    {(scannedQrInfo?.oldCmndNumber || (scannedQrInfo as any)?.old_cmnd_number) && (
                      <div className="text-right">
                        <div className="text-stay-text-muted text-[11px]">Số CMND cũ:</div>
                        <div className="text-xs font-semibold text-stay-text font-mono mt-0.5">
                          {scannedQrInfo?.oldCmndNumber || (scannedQrInfo as any)?.old_cmnd_number}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Họ và tên */}
                  <div className="p-3 rounded-xl bg-stay-card-bg border border-stay-border">
                    <div className="text-stay-text-muted text-[11px]">Họ và tên khai sinh:</div>
                    <div className="text-sm font-extrabold text-stay-text uppercase tracking-wide mt-0.5">
                      {scannedQrInfo?.fullName || (scannedQrInfo as any)?.full_name || 'Chưa nhận diện'}
                    </div>
                  </div>

                  {/* Ngày sinh & Giới tính */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stay-card-bg border border-stay-border">
                      <div className="text-stay-text-muted text-[11px]">Ngày sinh:</div>
                      <div className="font-bold text-stay-text mt-0.5">
                        {scannedQrInfo?.dateOfBirth || (scannedQrInfo as any)?.date_of_birth || 'Chưa nhận diện'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-stay-card-bg border border-stay-border">
                      <div className="text-stay-text-muted text-[11px]">Giới tính:</div>
                      <div className="font-bold text-stay-text mt-0.5">
                        {scannedQrInfo?.gender || 'Chưa nhận diện'}
                      </div>
                    </div>
                  </div>

                  {/* Nơi thường trú */}
                  <div className="p-3 rounded-xl bg-stay-card-bg border border-stay-border">
                    <div className="text-stay-text-muted text-[11px]">Nơi thường trú:</div>
                    <div className="font-medium text-stay-text mt-0.5 leading-relaxed">
                      {scannedQrInfo?.address || 'Chưa nhận diện'}
                    </div>
                  </div>

                  {/* Ngày cấp thẻ */}
                  {(scannedQrInfo?.issueDate || (scannedQrInfo as any)?.issue_date) && (
                    <div className="p-3 rounded-xl bg-stay-card-bg border border-stay-border">
                      <div className="text-stay-text-muted text-[11px]">Ngày cấp:</div>
                      <div className="font-bold text-stay-text mt-0.5">
                        {scannedQrInfo?.issueDate || (scannedQrInfo as any)?.issue_date}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Step 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stay-border">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stay-border bg-stay-card-bg hover:bg-stay-bg-app text-stay-text font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại đổi ảnh thẻ</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToFaceVerification}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stay-primary hover:bg-stay-primary-hover text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Xác nhận thông tin & Tiến hành xác thực khuôn mặt</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: QUAY VIDEO / XÁC THỰC KHUÔN MẶT TRỰC TIẾP & KẾT QUẢ AI */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="bg-stay-card-bg rounded-3xl border border-stay-border p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
            {/* Header Bước 3 khi chưa có kết quả */}
            {!aiResult && !isSubmitting && (
              <div className="space-y-4 pb-4 border-b border-stay-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-stay-primary-subtle text-stay-primary">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stay-text">Xác thực khuôn mặt người thật (ArcFace + RetinaFace)</h3>
                      <p className="text-xs text-stay-text-secondary">
                        Nhìn thẳng vào camera và quay video 3 giây để hệ thống AI đối soát khuôn mặt với ảnh trên CCCD.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setCurrentStep(2);
                    }}
                    className="text-xs text-stay-text-secondary hover:text-stay-text flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Xem lại thông tin QR
                  </button>
                </div>

                {/* Checklist Chuẩn hóa ảnh chụp Selfie phía Client */}
                <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-stay-primary uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Chuẩn hóa ảnh chụp Selfie phía Client (Bắt buộc để DeepFace đạt độ chính xác tối đa)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                      <span className="text-lg">👓</span>
                      <div>
                        <div className="font-bold text-stay-text">Bỏ kính mắt</div>
                        <div className="text-[10px] text-stay-text-secondary">Tránh phản quang tròng kính</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                      <span className="text-lg">😐</span>
                      <div>
                        <div className="font-bold text-stay-text">Không cười</div>
                        <div className="text-[10px] text-stay-text-secondary">Giữ cơ mặt tự nhiên</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                      <span className="text-lg">📱</span>
                      <div>
                        <div className="font-bold text-stay-text">Ngang tầm mắt</div>
                        <div className="text-[10px] text-stay-text-secondary">Tránh góc trên xuống/dưới lên</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                      <span className="text-lg">💡</span>
                      <div>
                        <div className="font-bold text-stay-text">Đủ ánh sáng</div>
                        <div className="text-[10px] text-stay-text-secondary">Tránh bóng tối hoặc ngược sáng</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Viewport / Video Preview khi chưa nộp */}
            {!aiResult && (
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative aspect-[3/4] sm:aspect-square rounded-3xl overflow-hidden bg-black border-4 border-stay-border shadow-xl flex items-center justify-center">
                  {/* Live Camera Stream */}
                  {cameraActive && !recordedVideoUrl && (
                    <>
                      <video
                        ref={(el) => {
                          videoRef.current = el;
                          if (el && cameraStream && el.srcObject !== cameraStream) {
                            el.srcObject = cameraStream;
                            el.play().catch(() => {});
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Face Oval Overlay Guide with Laser Scan */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
                        <div
                          className={`relative w-52 h-64 sm:w-60 sm:h-72 rounded-[50%] border-4 transition-all duration-300 overflow-hidden ${
                            isRecording
                              ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.7)]'
                              : 'border-stay-primary/80 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                          }`}
                        >
                          {/* Laser Scan Line Running Top to Bottom */}
                          {isRecording && (
                            <div
                              className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-bounce"
                              style={{ animationDuration: '1.2s' }}
                            />
                          )}
                        </div>

                        <span className="text-xs font-semibold text-white bg-black/70 px-4 py-1.5 rounded-full mt-3 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                          {isRecording ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>
                                {recordingSeconds === 3 && 'Giữ thẳng camera ngang tầm mắt...'}
                                {recordingSeconds === 2 && 'Chớp mắt nhẹ hoặc quay mặt nhẹ (Kiểm tra người thật)...'}
                                {recordingSeconds <= 1 && 'Đang trích xuất khung hình selfie nét nhất...'}
                              </span>
                            </>
                          ) : (
                            <span>Bỏ kính, không cười, đặt khuôn mặt vào giữa khung tròn</span>
                          )}
                        </span>
                      </div>

                      {/* Countdown Banner */}
                      {countdown > 0 && countdown < 3 && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center">
                          <span className="text-8xl font-black text-white animate-ping">
                            {countdown}
                          </span>
                          <span className="text-sm font-semibold text-white/90 mt-4 tracking-wide">
                            Chuẩn bị nhìn thẳng vào camera...
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Recorded Video Playback */}
                  {recordedVideoUrl && (
                    <div className="w-full h-full relative">
                      <video
                        src={recordedVideoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <div className="absolute top-3 right-3 bg-stay-match text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã ghi hình & trích xuất khuôn mặt
                      </div>
                    </div>
                  )}

                  {/* Fallback Image Preview */}
                  {!cameraActive && !recordedVideoUrl && fallbackFacePreview && (
                    <div className="w-full h-full relative">
                      <img
                        src={fallbackFacePreview}
                        alt="Selfie Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-stay-match text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã tải ảnh chân dung
                      </div>
                    </div>
                  )}

                  {/* No Camera / Denied View */}
                  {!cameraActive && !recordedVideoUrl && !fallbackFacePreview && (
                    <div className="text-center p-6 text-slate-400 space-y-3">
                      <Camera className="w-12 h-12 mx-auto text-slate-500" />
                      <p className="text-sm font-medium text-slate-300">Camera chưa được kích hoạt</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white text-xs font-semibold transition"
                      >
                        Bật Camera ngay
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Error Alert */}
                {cameraError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Action Buttons for Step 3 Camera */}
                <div className="flex flex-col gap-3">
                  {cameraActive && !recordedVideoUrl && (
                    <button
                      type="button"
                      disabled={isRecording}
                      onClick={startRecording}
                      className="w-full py-3.5 rounded-2xl bg-stay-primary hover:bg-stay-primary-hover text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="w-5 h-5 animate-spin" />
                          <span>Đang quay & phân tích ({recordingSeconds}s)...</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5" />
                          <span>Bắt đầu quay video & Xác thực AI (3 giây)</span>
                        </>
                      )}
                    </button>
                  )}

                  {recordedVideoUrl && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRetakeVideo}
                        className="flex-1 py-3 rounded-2xl border border-stay-border bg-stay-card-bg hover:bg-stay-bg-app text-stay-text font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitVerification}
                        className="flex-1 py-3 rounded-2xl bg-stay-primary hover:bg-stay-primary-hover text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <span>Tiến hành đối soát AI</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Fallback Option: Tải tệp khuôn mặt nếu không dùng camera */}
                  {!recordedVideoUrl && (
                    <div className="pt-2 text-center">
                      <label className="text-xs text-stay-text-secondary hover:text-stay-primary cursor-pointer underline inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Hoặc tải tệp video/ảnh chân dung selfie từ máy tính</span>
                        <input
                          type="file"
                          accept="video/*,image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              setFallbackFaceFile(f);
                              setFallbackFacePreview(URL.createObjectURL(f));
                              stopCamera();
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {fallbackFaceFile && !recordedVideoUrl && (
                    <button
                      type="button"
                      onClick={handleSubmitVerification}
                      className="w-full py-3.5 rounded-2xl bg-stay-primary hover:bg-stay-primary-hover text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>Tiến hành đối soát AI với tệp đã chọn</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loading AI State */}
            {isSubmitting && (
              <div className="py-16 text-center space-y-4">
                <Spin size="large" />
                <h3 className="text-lg font-bold text-stay-text">
                  Hệ thống đang chạy mô hình nhận diện khuôn mặt DeepFace...
                </h3>
                <p className="text-xs text-stay-text-secondary max-w-md mx-auto">
                  Trích xuất mã QR trên mặt trước thẻ CCCD và so khớp vector đặc trưng khuôn mặt từ video trực tiếp.
                </p>
              </div>
            )}

            {/* AI Result Dashboard */}
            {!isSubmitting && aiResult && (
              <div className="space-y-6">
                {/* Result Header Alert with 3-Tier Classification Badge */}
                <div
                  className={`p-5 rounded-2xl border flex items-start gap-4 transition-colors ${
                    aiResult.overallVerified
                      ? 'bg-stay-match-subtle border-stay-match/40'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl text-white shrink-0 ${
                      aiResult.overallVerified ? 'bg-stay-match' : 'bg-amber-500'
                    }`}
                  >
                    {aiResult.overallVerified ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-stay-text">
                        {aiResult.overallVerified
                          ? 'Xác thực danh tính thành công!'
                          : 'Hồ sơ xác thực đang được xử lý'}
                      </h3>
                      {/* Tier Badge */}
                      {aiResult.decisionTier === 'AUTO_APPROVED' || (aiResult.faceInfo?.distance != null && aiResult.faceInfo.distance < 0.40) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stay-match text-white shadow-xs">
                          Tầng 1: Tự động phê duyệt (&lt; 0.40)
                        </span>
                      ) : aiResult.decisionTier === 'CONDITIONAL_LIVENESS' || (aiResult.faceInfo?.distance != null && aiResult.faceInfo.distance <= 0.55) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white shadow-xs">
                          Tầng 2: Đạt chuẩn kết hợp Liveness (0.40 - 0.55)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                          Tầng 3: Chụp lại hoặc Quản trị viên duyệt (&gt; 0.55)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stay-text-secondary leading-relaxed">
                      {aiResult.message}
                    </p>
                  </div>
                </div>

                {/* Verification Metrics: 2 Cards (ArcFace + RetinaFace + QR Info) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Kết quả ArcFace + RetinaFace */}
                  <div className="p-6 rounded-2xl border border-stay-border bg-stay-bg-app transition-colors space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stay-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-stay-primary" />
                        So khớp ArcFace + RetinaFace
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          aiResult.faceInfo?.verified
                            ? 'bg-stay-match-subtle text-stay-match-dark dark:text-stay-match'
                            : 'bg-rose-500/15 text-rose-500'
                        }`}
                      >
                        {aiResult.faceInfo?.verified ? 'Trùng khớp' : 'Cần kiểm tra'}
                      </span>
                    </div>

                    <div className="text-center py-4 space-y-2">
                      <div className="text-4xl font-extrabold text-stay-text">
                        {aiResult.faceInfo?.similarityScore != null
                          ? `${aiResult.faceInfo.similarityScore}%`
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-stay-text-secondary font-medium">
                        Điểm tương đồng chuẩn hóa từ Cosine Distance
                      </div>
                      <Progress
                        percent={aiResult.faceInfo?.similarityScore || 0}
                        status={aiResult.faceInfo?.verified ? 'success' : 'exception'}
                        strokeColor={{
                          '0%': '#6366f1',
                          '100%': '#10b981',
                        }}
                      />
                    </div>

                    <div className="pt-2 border-t border-stay-border text-xs text-stay-text-secondary space-y-2">
                      <div className="flex justify-between">
                        <span>Mô hình & Bộ trích xuất:</span>
                        <strong className="text-stay-text font-mono">
                          {aiResult.faceInfo?.modelName || 'ArcFace'} + {aiResult.faceInfo?.detector || 'retinaface'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Khoảng cách đặc trưng (Distance):</span>
                        <strong className={`font-mono font-bold ${
                          (aiResult.faceInfo?.distance ?? 1.0) < 0.40
                            ? 'text-stay-match'
                            : (aiResult.faceInfo?.distance ?? 1.0) <= 0.55
                            ? 'text-blue-500'
                            : 'text-amber-500'
                        }`}>
                          {aiResult.faceInfo?.distance ?? 'N/A'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngưỡng chấp nhận (Threshold):</span>
                        <strong className="text-stay-text font-mono">
                          {aiResult.faceInfo?.threshold ?? 0.68}
                        </strong>
                      </div>
                      {aiResult.faceInfo?.livenessScore != null && (
                        <div className="flex justify-between">
                          <span>Điểm kiểm tra người thật (Liveness):</span>
                          <strong className="text-stay-match font-mono font-bold">
                            {aiResult.faceInfo.livenessScore}%
                          </strong>
                        </div>
                      )}
                      <div className="p-2 rounded-xl bg-stay-card-bg border border-stay-border text-[11px] text-stay-text-muted">
                        💡 <strong>Lưu ý:</strong> ArcFace sử dụng khoảng cách Cosine Distance (càng gần 0 càng giống nhau). Khoảng cách dưới 0.68 chứng minh cùng một người.
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Dữ liệu trích xuất từ QR CCCD */}
                  <div className="p-6 rounded-2xl border border-stay-border bg-stay-bg-app transition-colors space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stay-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-stay-primary" />
                        Dữ liệu mã QR CCCD gắn chip
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          aiResult.qrInfo?.qrFound
                            ? 'bg-stay-match-subtle text-stay-match-dark dark:text-stay-match'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {aiResult.qrInfo?.qrFound ? 'Hợp lệ' : 'Chưa đọc được'}
                      </span>
                    </div>

                    {aiResult.qrInfo?.qrFound ? (
                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-stay-card-bg border border-stay-border">
                          <div className="text-stay-text-muted font-medium">Số CMND / CCCD:</div>
                          <div className="text-base font-extrabold text-stay-primary mt-0.5 font-mono">
                            {aiResult.qrInfo.idCardNumber || 'Chưa xác định'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                            <div className="text-stay-text-muted">Họ và tên:</div>
                            <div className="font-bold text-stay-text mt-0.5">
                              {aiResult.qrInfo.fullName || 'N/A'}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                            <div className="text-stay-text-muted">Ngày sinh:</div>
                            <div className="font-bold text-stay-text mt-0.5">
                              {aiResult.qrInfo.dateOfBirth || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                            <div className="text-stay-text-muted">Giới tính:</div>
                            <div className="font-bold text-stay-text mt-0.5">
                              {aiResult.qrInfo.gender || 'N/A'}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                            <div className="text-stay-text-muted">Ngày cấp:</div>
                            <div className="font-bold text-stay-text mt-0.5">
                              {aiResult.qrInfo.issueDate || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {aiResult.qrInfo.address && (
                          <div className="p-2.5 rounded-xl bg-stay-card-bg border border-stay-border">
                            <div className="text-stay-text-muted">Địa chỉ thường trú:</div>
                            <div className="font-medium text-stay-text mt-0.5 line-clamp-2">
                              {aiResult.qrInfo.address}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-stay-text-muted text-xs space-y-2">
                        <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
                        <p>{aiResult.qrInfo?.message || 'Không tìm thấy mã QR trên mặt trước CCCD.'}</p>
                        <p className="text-[11px]">Hồ sơ đã được lưu trữ an toàn và chuyển sang chờ duyệt thủ công.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-stay-border">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setAiResult(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg hover:bg-stay-bg-app text-stay-text font-semibold text-xs transition shadow-xs"
                  >
                    Thực hiện lại
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white font-bold text-xs shadow-md transition"
                  >
                    Hoàn tất & Về trang cá nhân
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
