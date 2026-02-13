import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * 숫자 카운팅 애니메이션 컴포넌트
 * 숫자가 변경될 때 부드럽게 카운트업 애니메이션 표시
 */

interface AnimatedCounterProps {
  /** 표시할 숫자 값 */
  value: number;

  /** 애니메이션 강도 (기본: 100) */
  stiffness?: number;

  /** 애니메이션 감쇠 (기본: 30) */
  damping?: number;

  /** 소수점 자리수 (기본: 0, 정수만 표시) */
  decimals?: number;

  /** 천 단위 구분 기호 사용 여부 (기본: true) */
  useComma?: boolean;

  /** 접두사 (예: "$", "₩") */
  prefix?: string;

  /** 접미사 (예: "%", "개") */
  suffix?: string;

  /** 추가 className */
  className?: string;
}

export function AnimatedCounter({
  value,
  stiffness = 100,
  damping = 30,
  decimals = 0,
  useComma = true,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const motionValue = useSpring(0, {
    stiffness,
    damping,
  });

  const display = useTransform(motionValue, (latest) => {
    const rounded =
      decimals > 0 ? latest.toFixed(decimals) : Math.round(latest);

    const formatted = useComma
      ? Number(rounded).toLocaleString()
      : rounded.toString();

    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
