/**
 * Client Domain Constants (Frontend)
 */

export const GENDER_OPTIONS = [
  { label: 'Female', value: 'FEMALE' },
  { label: 'Male', value: 'MALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

export const GENDER_MAP = GENDER_OPTIONS.reduce((acc, curr) => {
  acc[curr.value] = curr.label;
  return acc;
}, {});
