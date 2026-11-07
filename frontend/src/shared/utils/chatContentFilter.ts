import { ContentFilterResult } from '@/shared/types/chat';

// Pattern nhận diện số điện thoại di động Việt Nam (kể cả dãn cách, dấu chấm, gạch ngang)
const PHONE_PATTERN =
  /(?:(?:\+84|84|0)(?:[\s.-]?[35789])(?:[\s.-]?\d){8})|(?:\b0[35789](?:[\s.-]?\d{2}){4}\b)|(?:\b0[35789](?:[\s.-]?\d{3}){2}\d{2}\b)/i;

// Pattern nhận diện số điện thoại viết dãn cách chữ số (ví dụ: 0 9 8 7 6 5 4 3 2 1)
const SPACED_PHONE_PATTERN = /\b0(?:\s+\d){9}\b/;

// Pattern nhận diện liên kết mạng xã hội hoặc mời chat ngoài sàn
const SOCIAL_LINK_PATTERN =
  /(?:https?:\/\/[\w.-]+(?:facebook|fb|zalo|telegram|t\.me|tiktok|instagram)[\w./?=&%-]*)|(?:\b(?:zalo\.me|fb\.com|fb\.me|m\.me|t\.me)\/[\w.-]+)|(?:\b(?:kết bạn|add|ib|inbox|liên hệ|nhắn|qua|tìm)\s+(?:zalo|fb|facebook|tele|telegram)\b)|(?:\b(?:zalo|zl|tele|fb)\s*[:=-]\s*\w+)/i;

// Pattern nhận diện số tài khoản ngân hàng kèm ngữ cảnh
const BANK_ACCOUNT_PATTERN =
  /(?:(?:stk|số\s+tài\s+khoản|số\s+tk|tài\s+khoản|ngân\s+hàng|vcb|vietcombank|techcombank|tcb|mb\s*bank|mbbank|agribank|bidv|acb|vpbank|tpbank|momo)\s*[:=-]?\s*([0-9]{8,18}))|(?:([0-9]{9,16})\s*(?:-\s*)?(?:vcb|vietcombank|techcombank|mb\s*bank|agribank|bidv|acb|vpbank|tpbank|momo))/i;

// Cụm từ rủi ro giục chuyển tiền cọc giữ chỗ ngoài sàn
const SUSPICIOUS_DEPOSIT_KEYWORDS = [
  'chuyển cọc',
  'cọc trước',
  'đặt cọc trước',
  'chuyển tiền giữ chỗ',
  'giữ phòng gấp',
  'chuyển cọc giữ phòng',
  'cọc xem phòng',
  'chuyển tiền cọc',
  'đặt cọc ngay',
  'cọc sớm',
  'bắn cọc',
  'bank cọc',
];

/**
 * Quét và kiểm tra nội dung tin nhắn chat theo chính sách an toàn của StayConnect
 */
export function analyzeMessageContent(text: string): ContentFilterResult {
  if (!text || !text.trim()) {
    return {
      isBlocked: false,
      violations: [],
      warningTitle: '',
      warningMessage: '',
    };
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();
  const violations: string[] = [];

  // 1. Quét số điện thoại
  const phoneMatch = cleanText.match(PHONE_PATTERN) || cleanText.match(SPACED_PHONE_PATTERN);
  if (phoneMatch) {
    violations.push(`Số điện thoại liên hệ cá nhân: "${phoneMatch[0].trim()}"`);
  }

  // 2. Quét liên kết mạng xã hội ngoài sàn
  const socialMatch = cleanText.match(SOCIAL_LINK_PATTERN);
  if (socialMatch) {
    violations.push(`Liên kết hoặc lời mời trao đổi ngoài sàn: "${socialMatch[0].trim()}"`);
  }

  // 3. Quét số tài khoản ngân hàng
  const bankMatch = cleanText.match(BANK_ACCOUNT_PATTERN);
  if (bankMatch) {
    violations.push(`Số tài khoản thanh toán: "${bankMatch[0].trim()}"`);
  }

  // 4. Quét cụm từ ép cọc giữ phòng
  for (const kw of SUSPICIOUS_DEPOSIT_KEYWORDS) {
    if (lowerText.includes(kw)) {
      violations.push(`Từ khóa rủi ro chuyển tiền cọc ngoài sàn: "${kw}"`);
      break;
    }
  }

  const isBlocked = violations.length > 0;

  let warningTitle = '';
  let warningMessage = '';

  if (isBlocked) {
    warningTitle = 'Tin nhắn bị chặn do vi phạm quy tắc an toàn giao dịch';
    warningMessage = `Hệ thống phát hiện ${violations.join(
      '; '
    )}. Để phòng tránh lừa đảo tiền cọc và đảm bảo quyền lợi khi xảy ra tranh chấp, StayConnect nghiêm cấm chia sẻ số điện thoại cá nhân, mạng xã hội ngoài sàn hoặc tài khoản chuyển khoản cọc khi chưa ký hợp đồng chính thức.`;
  }

  return {
    isBlocked,
    violations,
    warningTitle,
    warningMessage,
  };
}

