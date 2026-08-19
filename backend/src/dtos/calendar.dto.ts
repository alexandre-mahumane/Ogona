import { z } from 'zod';

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const calendarMonthQueryDto = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const calendarDateRangeDto = z
  .object({
    from: dateStr,
    to: dateStr,
  })
  .superRefine((data, ctx) => {
    if (data.to < data.from) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: '`to` deve ser >= `from`' });
    }
  });

export const setCalendarPriceDto = z
  .object({
    from: dateStr,
    to: dateStr,
    amount: z.number().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.to < data.from) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: '`to` deve ser >= `from`' });
    }
  });

export const calendarAvailabilityQueryDto = z
  .object({
    from: dateStr.optional(),
    to: dateStr.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.to < data.from) {
      ctx.addIssue({
        code: 'custom',
        path: ['to'],
        message: '`to` deve ser >= `from`',
      });
    }
  });

export type CalendarMonthQuery = z.infer<typeof calendarMonthQueryDto>;
export type CalendarDateRangeInput = z.infer<typeof calendarDateRangeDto>;
export type SetCalendarPriceInput = z.infer<typeof setCalendarPriceDto>;
export type CalendarAvailabilityQuery = z.infer<typeof calendarAvailabilityQueryDto>;
