import StepperMUI from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

interface StepperProps {
  currentStep: number;
  stepTitles: string[];
}

const Stepper = ({ currentStep, stepTitles }: StepperProps)  => {
  return (
    <StepperMUI activeStep={currentStep - 1} alternativeLabel>
      {stepTitles.map((title) => (
        <Step key={title}>
          <StepLabel>{title}</StepLabel>
        </Step>
      ))}
    </StepperMUI>
  );
};

export default Stepper;