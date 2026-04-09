import { Expense, Category } from './types';

export const CATEGORIES: Record<Category, { icon: string; color: string; bg: string; hex: string }> = {
  'Food & Drink': { icon: 'Utensils', color: 'text-orange-600', bg: 'bg-orange-100', hex: '#f97316' },
  'Transport': { icon: 'Car', color: 'text-blue-600', bg: 'bg-blue-100', hex: '#3b82f6' },
  'Housing': { icon: 'Home', color: 'text-indigo-600', bg: 'bg-indigo-100', hex: '#6366f1' },
  'Electronics': { icon: 'Smartphone', color: 'text-purple-600', bg: 'bg-purple-100', hex: '#a855f7' },
  'Travel': { icon: 'Plane', color: 'text-sky-600', bg: 'bg-sky-100', hex: '#0ea5e9' },
  'Healthcare': { icon: 'HeartPulse', color: 'text-red-600', bg: 'bg-red-100', hex: '#ef4444' },
  'Education': { icon: 'BookOpen', color: 'text-emerald-600', bg: 'bg-emerald-100', hex: '#10b981' },
  'Fitness': { icon: 'Dumbbell', color: 'text-yellow-600', bg: 'bg-yellow-100', hex: '#eab308' },
  'Other': { icon: 'CircleEllipsis', color: 'text-slate-600', bg: 'bg-slate-100', hex: '#6b7280' },
};

export const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    merchant: 'Starbucks',
    category: 'Food & Drink',
    date: 'Oct 27, 2023',
    amount: 5.40,
    icon: 'Utensils',
    color: 'bg-orange-100',
  },
  {
    id: '2',
    merchant: 'Uber',
    category: 'Transport',
    date: 'Oct 27, 2023',
    amount: 19.00,
    icon: 'Car',
    color: 'bg-blue-100',
  },
  {
    id: '3',
    merchant: 'IKEA',
    category: 'Housing',
    date: 'Oct 26, 2023',
    amount: 89.20,
    icon: 'Home',
    color: 'bg-indigo-100',
  },
  {
    id: '4',
    merchant: 'Apple Store',
    category: 'Electronics',
    date: 'Oct 25, 2023',
    amount: 45.00,
    icon: 'Smartphone',
    color: 'bg-purple-100',
  },
  {
    id: '5',
    merchant: 'Delta Airlines',
    category: 'Travel',
    date: 'Sep 24, 2023',
    amount: 215.50,
    icon: 'Plane',
    color: 'bg-sky-100',
  },
];

export const IMAGES = {
  RECEIPT_THUMB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWnWnODpFMLZPmqaQ1Qnfid15bkQvPEeYMHkAzWvYpU7kKWcutjhgCDGRe8yrPbeeMiM3BAmIrx1y8BKuWcElWLFAjOuWefsrt3iBUP2xB8Mj3nMJF0oHNnBjOcXSuZGw88IqrmVmND0nxsYYpGNYyGB1fgMw2qn4uHjWHgfQ14mytDv7WKUnJT-sdlLHvV65icX_4UuGu5PF9pnulZ3BoiKReANLXHBWhuj--sldHtRY13uhUkb8uWxl2xJN_o5HUiIvuZKsdS8Y',
  RECEIPT_FULL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHPcHMNuLDtHHdFbpPQcEb-JGpx5cOBafmkCeE37ATNdCRjS3kpR4gXBWGQ8r3SUb88-q-8zTToNP_6DFHoB8qw_0nsPJrj-0SE3zeZA39JnaICGuv71k4Ll7VDSOlrh-KS-VUBNFIkJn3KovxjQwVGlO56FfL-6dOCLp81_BwaducDFE77pX3pSeUzbXlNv4_1bnGaKXrMB9NCbNqDqvNRSNrXdnCvFHbn9coBVV4SAnZyZ9zU-4rvuH32Si0vbr4OILVAWf5oUc',
  AVATAR: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLTFx44Ao5l9usp7MZeYOrRHErdIIo_GC36JC35ZjNIwVFIGZNFSDA5E-KQYf5pl9dqQ1MJ17hLyPNnowwNTRCY9CB0t-eze3kgIg5O1a37tR7wdWAIU0MFNFChD_8glpRIiHMMAEnB-UqwP9mVBnPopC6BiW9bdyjeNENKYdFm6_G36yI7GTn-HV6_kTEnd2ekjckTOSBp2nVNaSDgvCi1dzXc3tWa3d1zaM5YZ34ai0M9XblSy-HrZ3ntdsWFq35GoAiJVt813Q',
};
