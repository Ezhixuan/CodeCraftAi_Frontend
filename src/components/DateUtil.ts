import dayjs from 'dayjs';
import type { ManipulateType } from 'dayjs';

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss
 * @param date 需要格式化的时间（默认当前时间）
 * @returns 格式化后的时间字符串
 */
export const formatDate = (date: Date | string | number = new Date()): string => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ss');
};

/**
 * 获取当前时间
 * @returns 当前时间对象
 */
export const now = (): Date => {
  return new Date();
};

/**
 * 获取前一周期时间
 * @param value 时间数量
 * @param unit 时间单位（day, week, month, year, hour, minute）
 * @param date 基准时间（默认当前时间）
 * @returns 前一周期的时间对象
 */
export const getPreviousPeriod = (
  value: number,
  unit: ManipulateType,
  date: Date | string | number = new Date()
): Date => {
  return dayjs(date).subtract(value, unit).toDate();
};

/**
 * 获取后一周期时间
 * @param value 时间数量
 * @param unit 时间单位（day, week, month, year, hour, minute）
 * @param date 基准时间（默认当前时间）
 * @returns 后一周期的时间对象
 */
export const getNextPeriod = (
  value: number,
  unit: ManipulateType,
  date: Date | string | number = new Date()
): Date => {
  return dayjs(date).add(value, unit).toDate();
};

/**
 * 获取格式化后的当前时间
 * @returns YYYY-MM-DD HH:mm:ss 格式的当前时间
 */
export const getCurrentFormatted = (): string => {
  return formatDate();
};

/**
 * 获取格式化后的前一周期时间
 * @param value 时间数量
 * @param unit 时间单位
 * @param date 基准时间（可选）
 * @returns 格式化后的前一周期时间字符串
 */
export const getFormattedPreviousPeriod = (
  value: number,
  unit: ManipulateType,
  date?: Date | string | number
): string => {
  const targetDate = date ?? new Date();
  return formatDate(getPreviousPeriod(value, unit, targetDate));
};

/**
 * 获取格式化后的后一周期时间
 * @param value 时间数量
 * @param unit 时间单位
 * @param date 基准时间（可选）
 * @returns 格式化后的后一周期时间字符串
 */
export const getFormattedNextPeriod = (
  value: number,
  unit: ManipulateType,
  date?: Date | string | number
): string => {
  const targetDate = date ?? new Date();
  return formatDate(getNextPeriod(value, unit, targetDate));
};

/**
 * 格式化应用时间显示
 * @param timeStr 时间字符串
 */
export const formatAppTime = (timeStr?: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 默认导出所有函数
export default {
  formatDate,
  now,
  getPreviousPeriod,
  getNextPeriod,
  getCurrentFormatted,
  getFormattedPreviousPeriod,
  getFormattedNextPeriod,
  formatAppTime
};
