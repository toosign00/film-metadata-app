import { z } from 'zod';

export const metadataSettingsSchema = z.object({
  cameraMake: z
    .string()
    .min(1, '올바른 카메라 제조사를 입력해주세요.')
    .regex(/^[a-zA-Z가-힣0-9\s]+$/, '올바른 카메라 제조사를 입력해주세요.'),
  cameraModel: z
    .string()
    .min(1, '올바른 카메라 모델을 입력해주세요.')
    .regex(
      /^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
      '올바른 카메라 모델을 입력해주세요.'
    ),
  filmInfo: z
    .string()
    .min(1, '형식: Kodak Portra 400')
    .regex(/^[a-zA-Z0-9가-힣\s]+(\s\d+)?$/, '형식: Kodak Portra 400'),
  lens: z
    .string()
    .min(1, '올바른 렌즈 정보를 입력해주세요.')
    .regex(
      /^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
      '올바른 렌즈 정보를 입력해주세요.'
    ),
  lensInfo: z
    .string()
    .min(1, '렌즈 정보를 정확히 입력해주세요. (예: 50mm f1.8, 28mm f2.8)')
    .refine((value) => !value.includes('/'), {
      message: '렌즈 정보에 "/" 문자를 사용하지 마세요. (예: 50mm f1.8, 28mm f2.8)',
    })
    .refine((value) => {
      // 공백/대소문자 정규화 후 패턴 검사
      const normalized = value.trim().replace(/\s+/g, ' ').toLowerCase();
      const lensInfoRegex = /^(\d+(\.\d+)?)(mm)?\s*f(\d+(\.\d+)?)$/;
      return lensInfoRegex.test(normalized);
    }, '렌즈 정보를 정확히 입력해주세요. (예: 50mm f1.8, 28mm f2.8)'),
  isoValue: z
    .string()
    .min(1, '올바른 ISO 값을 입력해주세요.')
    .regex(/^[0-9]+$/, '올바른 ISO 값을 입력해주세요.'),
  startDate: z
    .date()
    .refine((v) => v instanceof Date && !Number.isNaN(v.getTime()), '날짜를 선택해주세요.'),
  startTime: z
    .date()
    .refine((v) => v instanceof Date && !Number.isNaN(v.getTime()), '시간을 선택해주세요.'),
});

export type MetadataSettingsSchema = z.infer<typeof metadataSettingsSchema>;
