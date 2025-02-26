// comment: This file is not being used, it represents the direction I was going in.
// file for mutli step form configuration
// the idea was that each parent component that wanted to use mutli step form could configure it from the outside using this kind of file
// both the current approach and this one have pros and cons

import * as z from 'zod';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'checkbox';
  validation: z.ZodTypeAny;
}

export interface FormStep {
  id: string;
  title: string;
  fields: FormField[];
}

const formConfig: FormStep[] = [
  {
    id: 'step1',
    title: 'Personal Information',
    fields: [
      { 
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        validation: z.string().min(2, 'Name must be at least 2 characters'),
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        validation: z.string().min(2, 'Invalid last name'),
      },
      {
        name: 'dob',
        label: 'Date of Birth (Age in Years)',
        type: 'number',
        validation: z.number().min(18, 'You must be at least 18 years old'),
      },
    ],
  },
  {
    id: 'step2',
    title: 'Contact Information',
    fields: [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        validation: z.string().email('Invalid email format'),
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        validation: z.string().regex(/^\+?[1-9]/, 'Invalid phone number format'),
      },
    ],
  },
  {
    id: 'step3',
    title: 'Loan Details',
    fields: [
      {
        name: 'loanAmount',
        label: 'Loan Amount',
        type: 'number',
        validation: z.number()
          .min(10000, 'Loan amount must be at least 10,000')
          .max(70000, 'Loan amount cannot exceed 70,000'),
      },
      {
        name: 'upfrontPayment',
        label: 'Upfront Payment',
        type: 'number',
        validation: z.number().refine((val, ctx) => {
          const loanAmount = ctx.parent.loanAmount;
          return val < loanAmount;
        }, 'Upfront payment must be lower than the loan amount'),
      },
      {
        name: 'terms',
        label: 'Loan Terms (Months)',
        type: 'number',
        validation: z.number()
          .min(10, 'Terms must be at least 10 months')
          .max(30, 'Terms cannot exceed 30 months')
      },
    ],
  },
  {
    id: 'step4',
    title: 'Financial Information',
    fields: [
      {
        name: 'monthlySalary',
        label: 'Monthly Salary',
        type: 'number',
        validation: z.number().min(1, 'Monthly salary is required'),
      },
      {
        name: 'hasAdditionalIncome',
        label: 'Has Additional Income?',
        type: 'checkbox',
        validation: z.boolean(),
      },
      {
        name: 'additionalIncome',
        label: 'Additional Income',
        type: 'number',
        validation: z.number().optional(),
      },
      {
        name: 'hasMortgage',
        label: 'Has Mortgage?',
        type: 'checkbox',
        validation: z.boolean(),
      },
      {
        name: 'mortgage',
        label: 'Mortgage Amount',
        type: 'number',
        validation: z.number().optional(),
      },
      {
        name: 'hasOtherCredits',
        label: 'Has Other Credits?',
        type: 'checkbox',
        validation: z.boolean(),
      },
      {
        name: 'otherCredits',
        label: 'Other Credit Amount',
        type: 'number',
        validation: z.number().optional(),
      },
    ],
  },
];

export default formConfig;
