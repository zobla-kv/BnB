
// TODO: update '' to ''

import styles from './Form.module.css';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Stepper from './Stepper/Stepper';
import Summary from './Summary/Summary';

import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { get, add, patch } from '../../services/ApiService';
import AsyncButton from '../AsyncButton/AsyncButton';

export type FormSchema = z.infer<typeof formSchema>;

// comment: ideally this should be combined into an single object (see formConfig.ts file) //////////////////////
// commnet: texts should be stored in a separate file as constants
const formSchema = z.object({
  step1: z.object({
    firstName: z.string().min(5).regex(/^[A-Za-zÄÖÜäöüß]*$/, 'Only single name allowed in English or German'),
    lastName: z.string().min(5).regex(/^[A-Za-zÄÖÜäöüß]/, 'Only English or German letters'),
    dob: z.date()
         .min(new Date(new Date().setFullYear(new Date().getFullYear() - 79)), 'Age must not exceed 79 years')
         .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'You must be at least 18 years old'),

  }),
  step2: z.object({
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  }),
  step3: z.object({
    loanAmount: z.number().min(10000, 'Loan amount must be at least 10,000').max(70000, 'Loan amount cannot exceed 70,000'),
    upfrontPayment: z.number().superRefine((data, ctx) => {
      // TODO: add validation
    }),
    terms: z.number().min(10, 'Minimum loan term is 10 months').max(30, 'Maximum loan term is 30 months')
  }),
  step4: z.object({
    monthlySalary: z.number().min(1, 'Monthly salary is required'),
    hasAdditionalIncome: z.boolean(),
    additionalIncome: z.number().optional().nullable(),
    hasMortgage: z.boolean(),
    mortgage: z.number().optional().nullable(),
    hasOtherCredits: z.boolean(),
    otherCredits: z.number().optional().nullable(),
  }),
});

const fieldLabels: Record<string, string> = {
  'step1.firstName': 'First Namea',
  'step1.lastName': 'Last Name',
  'step1.dob': 'Date of Birth',
  'step2.email': 'Email',
  'step2.phone': 'Phone',
  'step3.loanAmount': 'Loan Amount',
  'step3.upfrontPayment': 'Upfront Payment',
  'step3.terms': 'Terms (in months)',
  'step4.monthlySalary': 'Monthly Salary',
  'step4.hasAdditionalIncome': 'Has Additional Income',
  'step4.additionalIncome': 'Additional Income',
  'step4.hasMortgage': 'Has Mortgage',
  'step4.mortgage': 'Mortgage Amount',
  'step4.hasOtherCredits': 'Has Other Credits',
  'step4.otherCredits': 'Other Credits',
};

const stepTitles: Record<string, string> = {
  step1: 'Personal Information',
  step2: 'Contact Details',
  step3: 'Loan Details',
  step4: 'Financial Information',
  step5: 'Summary'
};

/////////////////////////////////////////////////////////////////////

const Form = () => {
  const navigate = useNavigate();

  const {
    register,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const totalSteps = Object.keys(formSchema.shape).length + 1;

  useEffect(() => {
    // TODO: GET data from API and populate the form on load
  }, []);


  const handlePrevStep = (): void => {
    if (isLoading) {
      return;
    }
    if (currentStep - 1 === 0) {
      return;
    }
    setIsConfirmed(false);
    setCurrentStep(currentStep - 1);
    navigate(`/form/step/${currentStep - 1}`);
  }
  
  const handleNextStep = async (ev: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    ev.preventDefault();

    const stepKey = `step${currentStep}` as keyof FormSchema;

    console.log('currentStep: ', currentStep)

    // handle finalize
    if (isLastStep()) {
      await handleAdd(getValues()[stepKey]);
      // TODO: show toast / redirect
      return;
    }

    const isValid = await trigger(stepKey);
    if (!isValid) {
      console.log('Validation failed');
      return;
    }

    // comment: to be able to determine wheather data needs to be added to patched
    // each step should have 'completed' property (not implemented)
    // patch will never run in the current state
    await handleAdd(getValues()[stepKey]);
  };

  const handleAdd = async (stepData: any): Promise<any> => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // show spinner for longer
      const response = await add(stepData);

      if (!response.ok) {
        throw new Error();
      }

      navigateAfterSubmit();
      // TODO: show toast 
    } 
    catch (err) {
      // TODO: show toast
      alert('server failure');
      return;
    }
    finally {
      setIsLoading(false);
    }
  }

  // TODO: implement
  const handlePatch = async (data: any): Promise<any> => {
    return Promise.resolve();
  }

  const navigateAfterSubmit = (): void => {
    if (currentStep + 1 === totalSteps) {
      setCurrentStep(currentStep + 1);
      navigate('/form/summary');
    } else {
      setCurrentStep(currentStep + 1);
      navigate(`/form/step/${currentStep + 1}`);
    }
  }

  const isLastStep = (): boolean => currentStep === totalSteps;

  return (
    <div>
      <Stepper currentStep={currentStep} stepTitles={Object.values(stepTitles)} />

      <div className={styles.formWrapper}>

      <div className={styles.formHeader}>{stepTitles[`step${currentStep}`]}</div>

        <div className={styles.formBody}>
          <Routes>
            <Route path='/step/1' element={<Step1 register={register} errors={errors} />} />
            <Route path='/step/2' element={<Step2 register={register} errors={errors} />} />
            <Route path='/step/3' element={<Step3 register={register} errors={errors} />} />
            <Route path='/step/4' element={<Step4 register={register} errors={errors} watch={watch}/>} />
            <Route 
              path='/summary' 
              element={
                <Summary 
                  data={getValues()} 
                  stepTitles={stepTitles} 
                  fieldLabels={fieldLabels} 
                  onConfirmChange={() => setIsConfirmed(!isConfirmed)}
                />
              } 
            />
          </Routes>
        </div>

        <div className={`${styles.formFooter} mt-5`}>
          <button type='button' className='btn-primary' onClick={handlePrevStep}>Previous</button>
          <AsyncButton 
            className='btn-primary' 
            isLoading={isLoading} 
            onClick={(ev) => handleNextStep(ev)} 
            // TODO: show some style change
            disabled={isLastStep() && !isConfirmed}
          > 
              {currentStep === totalSteps ? 'Finalize': 'Next'}
          </AsyncButton>
        </div>
      </div>
    </div>
  );  
};

const Step1 = ({ register, errors }: any) => (
  <>
    <div className={styles.formGroup}>
      <label htmlFor='firstName'>{fieldLabels['step1.firstName']}</label>
      <input id='firstName' type='text' {...register('step1.firstName')} />
      {errors.step1?.firstName && <span className={styles.error}>{errors.step1.firstName.message}</span>}
    </div>
    
    <div className={`${styles.formGroup} mt-5`}>
      <label htmlFor='lastName'>{fieldLabels['step1.lastName']}</label>
      <input id='lastName' type='text' {...register('step1.lastName')} />
      {errors.step1?.lastName && <span className={styles.error}>{errors.step1.lastName.message}</span>}
    </div>

    <div className={`${styles.formGroup} mt-5`}>
      <label htmlFor='dob'>{fieldLabels['step1.dob']}</label>
      <input id='dob' type='date' {...register('step1.dob', { valueAsDate: true })} />
      {errors.step1?.dob && <span className={styles.error}>{errors.step1.dob.message}</span>}
    </div>
  </>
);

const Step2 = ({ register, errors }: any) => (
  <>
    <div className={styles.formGroup}>
      <label htmlFor='email'>{fieldLabels['step2.email']}</label>
      <input id='email' type='text' {...register('step2.email')} />
      {errors.step2?.email && <span className={styles.error}>{errors.step2.email.message}</span>}
    </div>

    <div className={`${styles.formGroup} mt-5`}>
      <label htmlFor='phone'>{fieldLabels['step2.phone']}</label>
      <input id='phone' type='text' {...register('step2.phone')} />
      {errors.step2?.phone && <span className={styles.error}>{errors.step2.phone.message}</span>}
    </div>
  </>
);

const Step3 = ({ register, errors }: any) => (
  <>
    <div className={styles.formGroup}>
      <label htmlFor='loanAmount'>{fieldLabels['step3.loanAmount']}</label>
      <input id='loanAmount' type='number' {...register('step3.loanAmount', { valueAsNumber: true })} />
      {errors.step3?.loanAmount && <span className={styles.error}>{errors.step3.loanAmount.message}</span>}
    </div>

    <div className={`${styles.formGroup} mt-5`}>
      <label htmlFor='upfrontPayment'>{fieldLabels['step3.upfrontPayment']}</label>
      <input id='upfrontPayment' type='number' {...register('step3.upfrontPayment', { valueAsNumber: true })} />
      {errors.step3?.upfrontPayment && <span className={styles.error}>{errors.step3.upfrontPayment.message}</span>}
    </div>

    <div className={`${styles.formGroup} mt-5`}>
      <label htmlFor='terms'>{fieldLabels['step3.terms']}</label>
      <input id='terms' type='number' {...register('step3.terms', { valueAsNumber: true })} />
      {errors.step3?.terms && <span className={styles.error}>{errors.step3.terms.message}</span>}
    </div>
  </>
);

const Step4 = ({ register, errors, watch }: any) => {
  const hasAdditionalIncome = watch('step4.hasAdditionalIncome', false);
  const hasMortgage = watch('step4.hasMortgage', false);
  const hasOtherCredits = watch('step4.hasOtherCredits', false);

  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor='monthlySalary'>{fieldLabels['step4.monthlySalary']}</label>
        <input id='monthlySalary' type='number' {...register('step4.monthlySalary', { valueAsNumber: true })} />
        {errors.step4?.monthlySalary && <span className={styles.error}>{errors.step4.monthlySalary.message}</span>}
      </div>

      <div className='mt-5'>
        <label>
          <input type='checkbox' {...register('step4.hasAdditionalIncome')} />
          Do you have additional income?
        </label>
      </div>
      {hasAdditionalIncome && (
        <div className={styles.formGroup}>
          <label htmlFor='additionalIncome'>{fieldLabels['step4.additionalIncome']}</label>
          <input id='additionalIncome' type='number' {...register('step4.additionalIncome', { valueAsNumber: true })} />
        </div>
      )}

      <div>
        <label>
          <input type='checkbox' {...register('step4.hasMortgage')} />
          Do you have a mortgage?
        </label>
      </div>
      {hasMortgage && (
        <div className={styles.formGroup}>
          <label htmlFor='mortgage'>{fieldLabels['step4.mortgage']}</label>
          <input id='mortgage' type='number' {...register('step4.mortgage', { valueAsNumber: true })} />
        </div>
      )}

      <div>
        <label>
          <input type='checkbox' {...register('step4.hasOtherCredits')} />
          Do you have other credits?
        </label>
      </div>
      {hasOtherCredits && (
        <div className={styles.formGroup}>
          <label htmlFor='otherCredits'>{fieldLabels['step4.otherCredits']}</label>
          <input id='otherCredits' type='number' {...register('step4.otherCredits', { valueAsNumber: true })} />
        </div>
      )}

      {errors.step4?.message && <span className={styles.error}>{errors.step4.message}</span>}
    </>
  );
};


export default Form;

