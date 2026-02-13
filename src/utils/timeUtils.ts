import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';

// 플러그인 등록
dayjs.extend(relativeTime);
dayjs.extend(calendar);

/**
 * 현재 시점 기준으로 상대적인 시간을 반환
 * 예: "in 10 minutes", "a few seconds ago", "in 2 hours"
 */
export const getRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

/**
 * 달력 기준으로 자연스러운 시간을 반환
 * 예: "Tomorrow at 10:00 AM", "Today at 2:30 PM"
 */
export const getNaturalTime = (date: string | Date) => {
  return dayjs(date).calendar(null, {
    sameDay: '[Today at] h:mm A', // 오늘
    nextDay: '[Tomorrow at] h:mm A', // 내일
    nextWeek: 'dddd [at] h:mm A', // 이번 주 (예: Monday at ...)
    lastDay: '[Yesterday at] h:mm A', // 어제
    lastWeek: '[Last] dddd [at] h:mm A', // 지난 주
    sameElse: 'MMM D, YYYY', // 그 외 (예: Oct 15, 2025)
  });
};
