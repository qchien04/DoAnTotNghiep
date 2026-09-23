import { message as antMessage, notification as antNotification } from 'antd';
import type { MessageArgsProps } from 'antd';

// Global configuration for StayConnect Toast Messages
antMessage.config({
  duration: 3,
  maxCount: 3,
  top: 72,
});

export const message = antMessage;
export const notification = antNotification;
export type { MessageArgsProps };

export default message;
